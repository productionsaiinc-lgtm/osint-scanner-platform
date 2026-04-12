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
import { getPayPalClient } from "./paypal-integration";

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
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

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

  // Create PayPal checkout order for $20 premium subscription
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const paypal = getPayPalClient();
        const origin = ctx.req.headers.origin || "https://osintscan-fftqerzj.manus.space";

        const orderId = await paypal.createOrder(
          ctx.user.email || "user@example.com",
          `${origin}/payment-success`,
          `${origin}/payment-cancel?reason=user`
        );

        const approvalLink = `https://www.sandbox.paypal.com/checkoutnow/${orderId}`;

        return {
          checkoutUrl: approvalLink,
          orderId: orderId,
        };
      } catch (error) {
        console.error("[PayPal] Error creating checkout order:", error);
        throw new Error("Failed to create PayPal order");
      }
    }),

  // Capture PayPal order (complete payment)
  capturePayPalOrder: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const paypal = getPayPalClient();
        const order = await paypal.captureOrder(input.orderId);

        if (order.status !== "COMPLETED") {
          throw new Error("Order capture failed");
        }

        const amount = parseFloat(order.purchase_units[0].amount.value);
        await recordPayment({
          userId: ctx.user.id,
          paypalTransactionId: order.id,
          amount: Math.round(amount * 100),
          currency: "USD",
          status: "completed",
          paymentMethod: "paypal",
        });

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await createUserSubscription({
          userId: ctx.user.id,
          planId: 2,
          paypalSubscriptionId: order.id,
          status: "active",
          startDate,
          endDate,
          autoRenew: 1,
        });

        return {
          success: true,
          orderId: order.id,
          status: order.status,
          message: "Payment completed successfully",
        };
      } catch (error) {
        console.error("[PayPal] Error capturing order:", error);
        throw new Error("Failed to capture PayPal order");
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

        // Generate HTML receipt
        const htmlReceipt = generateHTMLReceipt(receiptData);

        return {
          success: true,
          receiptNumber: receiptData.receiptNumber,
          html: htmlReceipt,
          data: receiptData,
        };
      } catch (error) {
        console.error("[Receipt] Error generating receipt:", error);
        throw new Error("Failed to generate receipt");
      }
    }),

  // Get text receipt for email
  getTextReceipt: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const paymentRecords = await db
          .select()
          .from(payments)
          .where(eq(payments.id, input.paymentId));

        if (paymentRecords.length === 0) {
          throw new Error("Payment not found");
        }

        const payment = paymentRecords[0];

        if (payment.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        const receiptData = createReceiptData(
          payment,
          ctx.user.email || "",
          ctx.user.name || undefined,
          "OSINT Scanner Premium"
        );

        const textReceipt = generateTextReceipt(receiptData);

        return {
          success: true,
          text: textReceipt,
        };
      } catch (error) {
        console.error("[Receipt] Error generating text receipt:", error);
        throw new Error("Failed to generate text receipt");
      }
    }),
});
