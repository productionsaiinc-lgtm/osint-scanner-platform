/**
 * Stripe webhook handler for payment confirmations and subscription events
 */

import Stripe from "stripe";
import express from "express";
import { updateUserSubscriptionStatus, recordPayment, getPaymentByTransactionId, updatePaymentStatus } from "./subscription-db";
import { getDb } from "./db";
import { userSubscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia" as any,
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  body: string,
  signature: string
): { valid: boolean; event?: Stripe.Event } {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
      return { valid: false };
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    return { valid: true, event };
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    return { valid: false };
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("[Stripe] Processing checkout session:", session.id);

    if (!session.client_reference_id) {
      console.warn("[Stripe] No client_reference_id in session");
      return;
    }

    const userId = parseInt(session.client_reference_id);
    if (isNaN(userId)) {
      console.warn("[Stripe] Invalid user ID in session");
      return;
    }

    // Get payment amount
    const amount = session.amount_total || 0;
    const currency = session.currency?.toUpperCase() || "USD";

    // Record payment in database
    await recordPayment({
      userId,
      paypalTransactionId: session.id, // Use Stripe session ID as transaction ID
      amount,
      currency,
      status: "completed",
      paymentMethod: "stripe",
    });

    // Create or update subscription
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if user already has a subscription
    const existingSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription
      const sub = existingSubscription[0];
      const newEndDate = new Date();
      newEndDate.setMonth(newEndDate.getMonth() + 1); // 1 month from now

      await db
        .update(userSubscriptions)
        .set({
          status: "active",
          endDate: newEndDate,
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.id, sub.id));

      console.log(`[Stripe] Updated subscription for user ${userId}`);
    } else {
      // Create new subscription (plan 2 = Pro)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      await db.insert(userSubscriptions).values({
        userId,
        planId: 2, // Pro plan
        status: "active",
        startDate,
        endDate,
        autoRenew: 1,
      });

      console.log(`[Stripe] Created new subscription for user ${userId}`);
    }

    console.log(`[Stripe] Payment processed successfully for user ${userId}`);
  } catch (error) {
    console.error("[Stripe] Error handling checkout session:", error);
    throw error;
  }
}

/**
 * Handle payment intent succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("[Stripe] Payment intent succeeded:", paymentIntent.id);

    if (!paymentIntent.client_secret) {
      console.warn("[Stripe] No client_secret in payment intent");
      return;
    }

    // Update payment status to completed
    const payment = await getPaymentByTransactionId(paymentIntent.id);
    if (payment) {
      await updatePaymentStatus(payment.id, "completed");
      console.log(`[Stripe] Updated payment status for ${paymentIntent.id}`);
    }
  } catch (error) {
    console.error("[Stripe] Error handling payment intent succeeded:", error);
  }
}

/**
 * Handle payment intent failed event
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("[Stripe] Payment intent failed:", paymentIntent.id);

    // Update payment status to failed
    const payment = await getPaymentByTransactionId(paymentIntent.id);
    if (payment) {
      await updatePaymentStatus(payment.id, "failed");
      console.log(`[Stripe] Updated payment status to failed for ${paymentIntent.id}`);
    }
  } catch (error) {
    console.error("[Stripe] Error handling payment intent failed:", error);
  }
}

/**
 * Handle charge refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log("[Stripe] Charge refunded:", charge.id);

    // Update payment status to refunded
    const payment = await getPaymentByTransactionId(charge.id);
    if (payment) {
      await updatePaymentStatus(payment.id, "refunded");
      console.log(`[Stripe] Updated payment status to refunded for ${charge.id}`);
    }
  } catch (error) {
    console.error("[Stripe] Error handling charge refunded:", error);
  }
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  try {
    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    console.log(`[Stripe Webhook] Successfully processed event: ${event.type}`);
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    throw error;
  }
}

/**
 * Register Stripe webhook route with Express app
 */
export function registerStripeWebhook(app: any) {
  // Use raw body for webhook signature verification
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req: any, res: any) => {
      const signature = req.headers["stripe-signature"];

      if (!signature) {
        console.warn("[Stripe Webhook] Missing stripe-signature header");
        return res.status(400).json({ error: "Missing signature" });
      }

      const { valid, event } = verifyStripeSignature(req.body.toString(), signature);

      if (!valid || !event) {
        console.warn("[Stripe Webhook] Invalid signature");
        return res.status(400).json({ error: "Invalid signature" });
      }

      try {
        await handleStripeWebhook(event);
        res.json({ received: true });
      } catch (error) {
        console.error("[Stripe Webhook] Error:", error);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );

  console.log("[Stripe Webhook] Registered at /api/webhooks/stripe");
}
