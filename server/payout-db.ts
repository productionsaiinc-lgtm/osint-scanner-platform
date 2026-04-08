/**
 * Database helpers for payout management
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { payments } from "../drizzle/schema";

export interface PayoutRecord {
  id: number;
  paymentId: number;
  payoutBatchId: string;
  payoutItemId?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "returned";
  processedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

/**
 * Record a payout in the database
 */
export async function recordPayout(
  paymentId: number,
  payoutBatchId: string,
  amount: number,
  status: "pending" | "completed" | "failed" = "pending"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Update payment record with payout info
    // Note: Payout tracking is done via payment status and metadata
    await db
      .update(payments)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    console.log(`[Payout DB] Recorded payout ${payoutBatchId} for payment ${paymentId}`);
    return { success: true, payoutBatchId };
  } catch (error) {
    console.error("[Payout DB] Failed to record payout:", error);
    throw error;
  }
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  paymentId: number,
  status: "pending" | "completed" | "failed" | "returned",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const updateData: any = {
      status: status === "returned" ? "refunded" : status,
      updatedAt: new Date(),
    };

    await db.update(payments).set(updateData).where(eq(payments.id, paymentId));

    console.log(`[Payout DB] Updated payment ${paymentId} status to ${status}`);
    return { success: true };
  } catch (error) {
    console.error("[Payout DB] Failed to update payout status:", error);
    throw error;
  }
}

/**
 * Get pending payouts
 */
export async function getPendingPayouts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "completed"));

    return result;
  } catch (error) {
    console.error("[Payout DB] Failed to get pending payouts:", error);
    throw error;
  }
}

/**
 * Get payout history
 */
export async function getPayoutHistory(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "completed"))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Payout DB] Failed to get payout history:", error);
    throw error;
  }
}

/**
 * Calculate total revenue for payout
 */
export async function calculateTotalRevenueForPayout() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "completed"));

    const totalAmount = result.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return totalAmount;
  } catch (error) {
    console.error("[Payout DB] Failed to calculate revenue:", error);
    throw error;
  }
}
