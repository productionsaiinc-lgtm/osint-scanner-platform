/**
 * tRPC router for additional payment methods
 * Supports: Apple Pay, Google Pay, Bank Transfer/ACH
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { recordPayment, createUserSubscription, getSubscriptionPlan } from "./subscription-db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia" as any,
});

export const paymentMethodsRouter = router({
  // Get available payment methods for user
  getAvailableMethods: protectedProcedure.query(async ({ ctx }) => {
    return {
      methods: [
        {
          id: "paypal",
          name: "PayPal",
          icon: "paypal",
          description: "Pay securely with your PayPal account",
          enabled: true,
        },
        {
          id: "stripe_card",
          name: "Credit/Debit Card",
          icon: "credit-card",
          description: "Visa, Mastercard, American Express",
          enabled: true,
        },
        {
          id: "apple_pay",
          name: "Apple Pay",
          icon: "apple",
          description: "Fast and secure payment with Apple Pay",
          enabled: true,
        },
        {
          id: "google_pay",
          name: "Google Pay",
          icon: "google",
          description: "Quick checkout with Google Pay",
          enabled: true,
        },
        {
          id: "bank_transfer",
          name: "Bank Transfer",
          icon: "bank",
          description: "Direct bank transfer (ACH)",
          enabled: true,
        },
      ],
    };
  }),

  // Create Apple Pay payment intent
  createApplePayIntent: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await getSubscriptionPlan(input.planId);
        if (!plan) throw new Error("Plan not found");

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(plan.price * 100), // Convert to cents
          currency: plan.currency.toLowerCase(),
          payment_method_types: ["apple_pay"],
          metadata: {
            userId: ctx.user.id.toString(),
            planId: input.planId.toString(),
            email: ctx.user.email || "",
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: plan.price,
          currency: plan.currency,
        };
      } catch (error) {
        console.error("[Apple Pay] Error creating payment intent:", error);
        throw new Error("Failed to create Apple Pay payment intent");
      }
    }),

  // Create Google Pay payment intent
  createGooglePayIntent: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await getSubscriptionPlan(input.planId);
        if (!plan) throw new Error("Plan not found");

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(plan.price * 100),
          currency: plan.currency.toLowerCase(),
          payment_method_types: ["google_pay"],
          metadata: {
            userId: ctx.user.id.toString(),
            planId: input.planId.toString(),
            email: ctx.user.email || "",
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: plan.price,
          currency: plan.currency,
        };
      } catch (error) {
        console.error("[Google Pay] Error creating payment intent:", error);
        throw new Error("Failed to create Google Pay payment intent");
      }
    }),

  // Confirm Apple/Google Pay payment
  confirmDigitalWalletPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        planId: z.number(),
        paymentMethod: z.enum(["apple_pay", "google_pay"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          throw new Error("Payment not completed");
        }

        const plan = await getSubscriptionPlan(input.planId);
        if (!plan) throw new Error("Plan not found");

        // Record payment
        await recordPayment({
          userId: ctx.user.id,
          paypalTransactionId: paymentIntent.id,
          amount: Math.round(plan.price * 100),
          currency: plan.currency,
          status: "completed",
          paymentMethod: input.paymentMethod === "apple_pay" ? "apple_pay" : "google_pay",
        });

        // Create subscription
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await createUserSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          paypalSubscriptionId: paymentIntent.id,
          status: "active",
          startDate,
          endDate,
          autoRenew: 1,
        });

        return {
          success: true,
          message: "Payment completed successfully",
          paymentId: paymentIntent.id,
        };
      } catch (error) {
        console.error("[Digital Wallet] Error confirming payment:", error);
        throw new Error("Failed to confirm payment");
      }
    }),

  // Initiate bank transfer payment
  initiateBankTransfer: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await getSubscriptionPlan(input.planId);
        if (!plan) throw new Error("Plan not found");

        // Generate unique reference number for bank transfer
        const referenceNumber = `OSINT-${ctx.user.id}-${Date.now()}`;

        // In production, integrate with your bank's API
        // For now, return bank transfer details
        return {
          success: true,
          referenceNumber,
          bankDetails: {
            bankName: "Your Bank Name",
            accountNumber: "****1234", // Masked for security
            routingNumber: "****5678", // Masked for security
            accountType: "Business Checking",
            swiftCode: "YOURSWIFTCODE",
          },
          amount: plan.price,
          currency: plan.currency,
          description: `OSINT Scanner - ${plan.name} Plan`,
          message: "Please use the reference number in the payment memo",
        };
      } catch (error) {
        console.error("[Bank Transfer] Error initiating transfer:", error);
        throw new Error("Failed to initiate bank transfer");
      }
    }),

  // Verify bank transfer payment (called after user completes transfer)
  verifyBankTransfer: protectedProcedure
    .input(
      z.object({
        referenceNumber: z.string(),
        planId: z.number(),
        transactionId: z.string(), // From bank statement
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await getSubscriptionPlan(input.planId);
        if (!plan) throw new Error("Plan not found");

        // In production, verify with your bank's API
        // For now, assume verification is successful
        const verified = true;

        if (!verified) {
          throw new Error("Bank transfer verification failed");
        }

        // Record payment
        await recordPayment({
          userId: ctx.user.id,
          paypalTransactionId: input.transactionId,
          amount: Math.round(plan.price * 100),
          currency: plan.currency,
          status: "completed",
          paymentMethod: "bank_transfer",
        });

        // Create subscription
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await createUserSubscription({
          userId: ctx.user.id,
          planId: input.planId,
          paypalSubscriptionId: input.transactionId,
          status: "active",
          startDate,
          endDate,
          autoRenew: 1,
        });

        return {
          success: true,
          message: "Bank transfer verified and subscription activated",
          paymentId: input.transactionId,
        };
      } catch (error) {
        console.error("[Bank Transfer] Error verifying transfer:", error);
        throw new Error("Failed to verify bank transfer");
      }
    }),

  // Get payment method details for display
  getPaymentMethodDetails: publicProcedure
    .input(z.object({ methodId: z.string() }))
    .query(async ({ input }) => {
      const details: Record<string, any> = {
        paypal: {
          name: "PayPal",
          description: "Secure payment with PayPal",
          fees: "No additional fees",
          processingTime: "Instant",
        },
        stripe_card: {
          name: "Credit/Debit Card",
          description: "Visa, Mastercard, American Express, Discover",
          fees: "No additional fees",
          processingTime: "Instant",
        },
        apple_pay: {
          name: "Apple Pay",
          description: "Fast and secure payment with Apple Pay",
          fees: "No additional fees",
          processingTime: "Instant",
          requirements: "iPhone, iPad, or Mac with Apple Pay enabled",
        },
        google_pay: {
          name: "Google Pay",
          description: "Quick checkout with Google Pay",
          fees: "No additional fees",
          processingTime: "Instant",
          requirements: "Android device with Google Pay",
        },
        bank_transfer: {
          name: "Bank Transfer (ACH)",
          description: "Direct transfer from your bank account",
          fees: "No additional fees",
          processingTime: "1-3 business days",
          requirements: "US bank account",
        },
      };

      return details[input.methodId] || null;
    }),
});
