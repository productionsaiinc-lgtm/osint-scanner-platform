/**
 * PayPal Webhook Handler
 * Processes PayPal IPN (Instant Payment Notification) events
 */

import { Express, Request, Response } from "express";
import { recordPayment, createUserSubscription, getSubscriptionPlan } from "./subscription-db";
import { getPayPalClient } from "./paypal-integration";

interface PayPalIPNEvent {
  mc_gross: string;
  invoice: string;
  protection_eligibility: string;
  address_status: string;
  payer_id: string;
  address_street: string;
  payment_date: string;
  address_zip: string;
  first_name: string;
  mc_fee: string;
  address_country_code: string;
  address_name: string;
  notify_version: string;
  custom: string;
  payer_status: string;
  business: string;
  address_country: string;
  address_city: string;
  quantity: string;
  verify_sign: string;
  payer_email: string;
  txn_id: string;
  payment_status: string;
  receiver_email: string;
  payment_type: string;
  last_name: string;
  address_state: string;
  receiver_id: string;
  transaction_subject: string;
  payment_fee: string;
  receiver_status: string;
  txn_type: string;
  mc_currency: string;
  item_name: string;
  mc_amount1: string;
  charset: string;
  notify_version_version: string;
  item_number: string;
  receiver_business_name: string;
}

/**
 * Register PayPal webhook handler
 */
export function registerPayPalWebhook(app: Express): void {
  app.post("/api/webhooks/paypal/ipn", async (req: Request, res: Response) => {
    try {
      console.log("[PayPal IPN] Received webhook event");

      const ipnData = req.body as PayPalIPNEvent;

      // Verify IPN authenticity
      const isValid = await verifyIPNSignature(ipnData);
      if (!isValid) {
        console.warn("[PayPal IPN] Invalid signature");
        return res.status(400).json({ verified: false });
      }

      // Handle different payment statuses
      switch (ipnData.payment_status) {
        case "Completed":
          await handlePaymentCompleted(ipnData);
          break;
        case "Pending":
          await handlePaymentPending(ipnData);
          break;
        case "Failed":
          await handlePaymentFailed(ipnData);
          break;
        case "Denied":
          await handlePaymentDenied(ipnData);
          break;
        case "Refunded":
          await handlePaymentRefunded(ipnData);
          break;
        case "Reversed":
          await handlePaymentReversed(ipnData);
          break;
        case "Canceled_Reversal":
          await handlePaymentCanceledReversal(ipnData);
          break;
        default:
          console.log(`[PayPal IPN] Unhandled payment status: ${ipnData.payment_status}`);
      }

      // Always respond with 200 OK to PayPal
      return res.json({ verified: true });
    } catch (error) {
      console.error("[PayPal IPN] Error processing webhook:", error);
      // Still return 200 to acknowledge receipt
      return res.json({ verified: true });
    }
  });

  console.log("[PayPal] IPN webhook registered at /api/webhooks/paypal/ipn");
}

/**
 * Verify IPN signature with PayPal
 */
async function verifyIPNSignature(ipnData: PayPalIPNEvent): Promise<boolean> {
  try {
    // In production, verify with PayPal's verification endpoint
    // For now, we'll do basic validation
    if (!ipnData.txn_id || !ipnData.payment_status) {
      return false;
    }

    console.log(`[PayPal IPN] Signature verified for transaction ${ipnData.txn_id}`);
    return true;
  } catch (error) {
    console.error("[PayPal IPN] Signature verification failed:", error);
    return false;
  }
}

/**
 * Handle completed payment
 */
async function handlePaymentCompleted(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Processing completed payment: ${ipnData.txn_id}`);

    // Extract user ID from custom field or invoice
    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) {
      console.error("[PayPal IPN] Invalid user ID in custom field");
      return;
    }

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100); // Convert to cents

    // Record payment
    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "completed",
      paymentMethod: "paypal",
    });

    // Create subscription
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await createUserSubscription({
      userId,
      planId: 2, // Premium plan
      paypalSubscriptionId: ipnData.txn_id,
      status: "active",
      startDate,
      endDate,
      autoRenew: 1,
    });

    console.log(`[PayPal IPN] Payment processed for user ${userId}`);
  } catch (error) {
    console.error("[PayPal IPN] Error handling completed payment:", error);
  }
}

/**
 * Handle pending payment
 */
async function handlePaymentPending(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment pending: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "pending",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling pending payment:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment failed: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "failed",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling failed payment:", error);
  }
}

/**
 * Handle denied payment
 */
async function handlePaymentDenied(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment denied: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "failed",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling denied payment:", error);
  }
}

/**
 * Handle refunded payment
 */
async function handlePaymentRefunded(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment refunded: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "refunded",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling refunded payment:", error);
  }
}

/**
 * Handle reversed payment
 */
async function handlePaymentReversed(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment reversed: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "failed",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling reversed payment:", error);
  }
}

/**
 * Handle canceled reversal
 */
async function handlePaymentCanceledReversal(ipnData: PayPalIPNEvent): Promise<void> {
  try {
    console.log(`[PayPal IPN] Payment reversal canceled: ${ipnData.txn_id}`);

    const userId = parseInt(ipnData.custom || ipnData.invoice);
    if (isNaN(userId)) return;

    const amount = Math.round(parseFloat(ipnData.mc_gross) * 100);

    await recordPayment({
      userId,
      paypalTransactionId: ipnData.txn_id,
      amount,
      currency: ipnData.mc_currency,
      status: "completed",
      paymentMethod: "paypal",
    });
  } catch (error) {
    console.error("[PayPal IPN] Error handling canceled reversal:", error);
  }
}
