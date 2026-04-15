/**
 * Automatic Payout Service
 * Handles direct PayPal payouts triggered by user payments
 */

import { getPayPalClient } from "./paypal-integration";
import { getDb } from "./db";
import { payouts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface PayoutRequest {
  userId: number;
  amount: number; // in cents
  currency: string;
  paymentId: number;
  recipientEmail: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  status?: string;
  message: string;
  error?: string;
}

/**
 * Initiate automatic payout to PayPal account
 */
export async function initiatePayout(request: PayoutRequest): Promise<PayoutResult> {
  try {
    const paypal = getPayPalClient();
    const db = await getDb();

    if (!db) {
      throw new Error("Database not available");
    }

    // Convert cents to dollars
    const amountInDollars = (request.amount / 100).toFixed(2);

    console.log(`[Payout] Initiating payout: $${amountInDollars} to ${request.recipientEmail}`);

    // Create payout batch with single item
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const payoutBatch = {
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "You have received a payout",
        email_message: "Thank you for using OSINT Scanner Platform. Your payout has been processed.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amountInDollars,
            currency_code: request.currency || "USD",
          },
          description: `OSINT Scanner Platform Payout - Payment #${request.paymentId}`,
          sender_item_id: `ITEM-${request.paymentId}`,
          receiver: request.recipientEmail,
        },
      ],
    };

    // Send payout via PayPal API
    const payoutResponse = await paypal.createPayout(payoutBatch);

    if (!payoutResponse || !payoutResponse.batch_header) {
      throw new Error("Invalid payout response from PayPal");
    }

    const payoutId = payoutResponse.batch_header.payout_batch_id;
    const payoutStatus = payoutResponse.batch_header.batch_status;

    // Record payout in database
    await recordPayout({
      userId: request.userId,
      paymentId: request.paymentId,
      amount: request.amount,
      currency: request.currency,
      payoutId,
      status: payoutStatus,
      recipientEmail: request.recipientEmail,
    });

    console.log(`[Payout] Payout initiated successfully: ${payoutId} (${payoutStatus})`);

    return {
      success: true,
      payoutId,
      status: payoutStatus,
      message: `Payout initiated: $${amountInDollars} to ${request.recipientEmail}`,
    };
  } catch (error) {
    console.error("[Payout] Error initiating payout:", error);
    return {
      success: false,
      message: "Failed to initiate payout",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Record payout in database
 */
export async function recordPayout(data: {
  userId: number;
  paymentId: number;
  amount: number;
  currency: string;
  payoutId: string;
  status: string;
  recipientEmail: string;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert payout record
    await db.insert(payouts).values({
      userId: data.userId,
      paymentId: data.paymentId,
      amount: data.amount,
      currency: data.currency,
      payoutId: data.payoutId,
      status: data.status,
      recipientEmail: data.recipientEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`[Payout] Payout recorded in database: ${data.payoutId}`);
  } catch (error) {
    console.error("[Payout] Error recording payout:", error);
    throw error;
  }
}

/**
 * Get payout status from PayPal
 */
export async function getPayoutStatus(payoutId: string): Promise<{
  status: string;
  items: Array<{
    itemId: string;
    status: string;
    amount: string;
  }>;
}> {
  try {
    const paypal = getPayPalClient();
    const response = await paypal.getPayoutStatus(payoutId);

    return {
      status: response.batch_header?.batch_status || "UNKNOWN",
      items: (response.items || []).map((item: any) => ({
        itemId: item.payout_item_id,
        status: item.transaction_status,
        amount: item.amount?.value || "0",
      })),
    };
  } catch (error) {
    console.error("[Payout] Error getting payout status:", error);
    throw error;
  }
}

/**
 * Update payout status in database
 */
export async function updatePayoutStatus(
  payoutId: string,
  status: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(payouts)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(payouts.payoutId, payoutId));

    console.log(`[Payout] Updated payout status: ${payoutId} -> ${status}`);
  } catch (error) {
    console.error("[Payout] Error updating payout status:", error);
    throw error;
  }
}

/**
 * Retry failed payout
 */
export async function retryFailedPayout(payoutId: string): Promise<PayoutResult> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get payout record
    const payoutRecords = await db
      .select()
      .from(payouts)
      .where(eq(payouts.payoutId, payoutId));

    if (payoutRecords.length === 0) {
      return {
        success: false,
        message: "Payout not found",
      };
    }

    const payout = payoutRecords[0];

    // Retry payout
    return await initiatePayout({
      userId: payout.userId,
      amount: payout.amount,
      currency: payout.currency,
      paymentId: payout.paymentId,
      recipientEmail: payout.recipientEmail,
    });
  } catch (error) {
    console.error("[Payout] Error retrying payout:", error);
    return {
      success: false,
      message: "Failed to retry payout",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get payout history for user
 */
export async function getUserPayoutHistory(userId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const history = await db
      .select()
      .from(payouts)
      .where(eq(payouts.userId, userId));

    return history;
  } catch (error) {
    console.error("[Payout] Error getting payout history:", error);
    throw error;
  }
}
