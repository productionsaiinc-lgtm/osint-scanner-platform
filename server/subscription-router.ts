/**
 * tRPC router for subscription and payment management
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createSubscriptionPlan,
  getSubscriptionPlan,
  getAllSubscriptionPlans,
  createUserSubscription,
  getUserSubscription,
  updateUserSubscriptionStatus,
  recordPayment,
  getPaymentHistory,
  hasActivePremiumSubscription,
  getUserSubscriptionFeatures,
  canUserAccessFeature,
  getPaymentByTransactionId,
} from "./subscription-db";
import { createReceiptData, generateHTMLReceipt, generateTextReceipt } from "./receipt-generator";
import { getDb } from "./db";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createProduct,
  createPlan,
  getSubscription,
  cancelSubscription,
} from "./paypal";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia" as any,
});

export const subscriptionRouter = router({
  // Get all available subscription plans
  plans: publicProcedure.query(async () => {
    return await getAllSubscriptionPlans();
  }),

  // Get specific plan details
  getPlan: publicProcedure.input(z.object({ planId: z.number() })).query(async ({ input }) => {
    return await getSubscriptionPlan(input.planId);
  }),

  // Get current user's subscription
  mySubscription: protectedProcedure.query(async ({ ctx }) => {
    return await getUserSubscription(ctx.user.id);
  }),

  // Check if user has active premium subscription
  hasPremium: protectedProcedure.query(async ({ ctx }) => {
    return await hasActivePremiumSubscription(ctx.user.id);
  }),

  // Get user's available features
  myFeatures: protectedProcedure.query(async ({ ctx }) => {
    return await getUserSubscriptionFeatures(ctx.user.id);
  }),

  // Check if user can access specific feature
  canAccessFeature: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      return await canUserAccessFeature(ctx.user.id, input.feature);
    }),

  // Get payment history
  paymentHistory: protectedProcedure.query(async ({ ctx }) => {
    return await getPaymentHistory(ctx.user.id);
  }),

  // Create PayPal subscription (called after user approves payment)
  createPayPalSubscription: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        paypalSubscriptionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify subscription with PayPal
        const paypalSub = await getSubscription(input.paypalSubscriptionId);

        if (paypalSub.status !== "ACTIVE") {
          throw new Error("PayPal subscription is not active");
        }

        // Create user subscription in database
        const startDate = new Date(paypalSub.start_time);
        const endDate = paypalSub.billing_info.next_billing_time
          ? new Date(paypalSub.billing_info.next_billing_time)
          : null;

        await createUserSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          paypalSubscriptionId: input.paypalSubscriptionId,
          status: "active",
          startDate,
          endDate: endDate || undefined,
          autoRenew: 1,
        });

        // Record payment
        const plan = await getSubscriptionPlan(input.planId);
        if (plan) {
          await recordPayment({
            userId: ctx.user.id,
            paypalTransactionId: input.paypalSubscriptionId,
            amount: plan.price,
            currency: plan.currency,
            status: "completed",
            paymentMethod: "paypal",
          });
        }

        return { success: true, message: "Subscription created successfully" };
      } catch (error) {
        console.error("[Subscription] Error creating PayPal subscription:", error);
        throw new Error("Failed to create subscription");
      }
    }),

  // Create Stripe checkout session for one-time payment
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: "OSINT Scanner Premium",
                  description: "Unlock unlimited scans and advanced tools",
                },
                unit_amount: 2000,
              },
              quantity: 1,
            },
          ],
          success_url: `${ctx.req.headers.origin}/payment-success`,
          cancel_url: `${ctx.req.headers.origin}/payment-cancel?reason=user`,
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
        });

        return {
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("[Stripe] Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  // Get receipt for payment
  getReceipt: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get payment from database
        const paymentRecords = await db
          .select()
          .from(payments)
          .where(eq(payments.id, input.paymentId));

        if (paymentRecords.length === 0) {
          throw new Error("Payment not found");
        }

        const payment = paymentRecords[0];

        // Verify user owns this payment
        if (payment.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Create receipt data
        const receiptData = createReceiptData(
          payment,
          ctx.user.email || "",
          ctx.user.name || undefined,
          "OSINT Scanner Premium"
        );

        return {
          html: generateHTMLReceipt(receiptData),
          text: generateTextReceipt(receiptData),
          receiptNumber: receiptData.receiptNumber,
        };
      } catch (error) {
        console.error("[Subscription] Error generating receipt:", error);
        throw new Error("Failed to generate receipt");
      }
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({ reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const subscription = await getUserSubscription(ctx.user.id);

        if (!subscription) {
          throw new Error("No active subscription found");
        }

        if (!subscription.paypalSubscriptionId) {
          throw new Error("PayPal subscription ID not found");
        }

        // Cancel with PayPal
        await cancelSubscription(
          subscription.paypalSubscriptionId,
          input.reason || "User requested cancellation"
        );

        // Update database
        await updateUserSubscriptionStatus(subscription.id, "cancelled");

        return { success: true, message: "Subscription cancelled successfully" };
      } catch (error) {
        console.error("[Subscription] Error cancelling subscription:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),

  // Admin: Create new subscription plan
  createPlan: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        billingCycle: z.enum(["monthly", "yearly"]),
        maxScansPerMonth: z.number().optional(),
        maxApiCalls: z.number().optional(),
        features: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can create plans
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        // Create PayPal product
        const product = await createProduct(
          input.name,
          `${input.name} subscription plan`,
          "SOFTWARE"
        );

        // Create PayPal plan
        const paypalPlan = await createPlan(
          product.id,
          input.name,
          `${input.name} subscription plan`,
          input.price,
          input.billingCycle
        );

        // Create database record
        await createSubscriptionPlan({
          name: input.name,
          price: input.price,
          billingCycle: input.billingCycle,
          maxScansPerMonth: input.maxScansPerMonth || 0,
          maxApiCalls: input.maxApiCalls || 0,
          features: JSON.stringify(input.features),
        });

        return {
          success: true,
          message: "Subscription plan created successfully",
          paypalPlanId: paypalPlan.id,
        };
      } catch (error) {
        console.error("[Subscription] Error creating plan:", error);
        throw new Error("Failed to create subscription plan");
      }
    }),
});
