/**
 * Automatic Payout Processor
 * Handles scheduled payouts based on accumulated earnings
 */

import { processPayout, getPayoutStatus } from "./paypal-payouts";

// Import types only (to avoid circular dependencies)
type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export interface PayoutConfig {
  enabled: boolean;
  minimumThreshold: number; // Minimum amount to trigger payout (e.g., $50)
  payoutSchedule: "daily" | "weekly" | "monthly" | "manual"; // How often to check
  lastPayoutDate: Date;
  nextPayoutDate: Date;
}

// Default configuration
const DEFAULT_CONFIG: PayoutConfig = {
  enabled: true,
  minimumThreshold: 50, // Minimum $50 to process payout
  payoutSchedule: "weekly", // Check weekly
  lastPayoutDate: new Date(),
  nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};

/**
 * Get current payout configuration
 */
export async function getPayoutConfig(): Promise<PayoutConfig> {
  // In production, this would be stored in database
  // For now, return default config
  return DEFAULT_CONFIG;
}

/**
 * Update payout configuration
 */
export async function updatePayoutConfig(config: Partial<PayoutConfig>): Promise<PayoutConfig> {
  const updated = { ...DEFAULT_CONFIG, ...config };
  // In production, save to database
  console.log("[Payouts] Config updated:", updated);
  return updated;
}

/**
 * Get pending payout amount
 * In production, this would query the database
 */
export async function getPendingPayoutAmount(): Promise<number> {
  // For now, return a mock value
  // In production, query actual pending payouts from database
  return 380; // Your current payout balance
}

/**
 * Process automatic payout if conditions are met
 */
export async function processAutomaticPayout(): Promise<{
  success: boolean;
  message: string;
  payoutId?: string;
  amount?: number;
}> {
  try {
    const config = await getPayoutConfig();

    // Check if automatic payouts are enabled
    if (!config.enabled) {
      return { success: false, message: "Automatic payouts are disabled" };
    }

    // Check if it's time for payout
    const now = new Date();
    if (now < config.nextPayoutDate) {
      return {
        success: false,
        message: `Next payout scheduled for ${config.nextPayoutDate.toISOString()}`,
      };
    }

    // Get pending payout amount
    const pendingAmount = await getPendingPayoutAmount();

    // Check if amount meets minimum threshold
    if (pendingAmount < config.minimumThreshold) {
      return {
        success: false,
        message: `Pending amount $${pendingAmount.toFixed(2)} is below minimum threshold of $${config.minimumThreshold}`,
      };
    }

    // Generate unique batch ID
    const batchId = `OSINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Process payout via PayPal
    console.log(`[Payouts] Processing automatic payout of $${pendingAmount.toFixed(2)}`);
    const payoutResponse = await processPayout(
      pendingAmount,
      "Automatic weekly payout from OSINT Scanner Platform",
      batchId
    );

        // Record payout in database
    const payoutId = payoutResponse.batch_header.payout_batch_id;
    const status = payoutResponse.batch_header.batch_status;

    console.log(`[Payouts] Payout recorded: ${payoutId} - Status: ${status}`);
    // In production, save to database
    // await db.insert(payouts).values({...})  // Update next payout date based on schedule
    const nextDate = calculateNextPayoutDate(config.payoutSchedule);
    await updatePayoutConfig({ nextPayoutDate: nextDate });

    return {
      success: true,
      message: `Payout of $${pendingAmount.toFixed(2)} processed successfully`,
      payoutId,
      amount: pendingAmount,
    };
  } catch (error) {
    console.error("[Payouts] Automatic payout failed:", error);
    return {
      success: false,
      message: `Payout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Calculate next payout date based on schedule
 */
function calculateNextPayoutDate(schedule: "daily" | "weekly" | "monthly" | "manual"): Date {
  const now = new Date();

  switch (schedule) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "manual":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Far future
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Get payout history
 */
export async function getPayoutHistory(limit: number = 10): Promise<Array<{ payoutId: string; amount: number; status: PayoutStatus; createdAt: Date }>> {
  try {
    // In production, query database
    console.log(`[Payouts] Retrieving last ${limit} payouts from history`);
    return [];
  } catch (error) {
    console.error("[Payouts] Failed to get history:", error);
    return [];
  }
}

/**
 * Check and update payout status
 */
export async function checkPayoutStatus(payoutId: string) {
  try {
    const status = await getPayoutStatus(payoutId);
    // In production, update database
    console.log(`[Payouts] Payout ${payoutId} status: ${status.batch_header.batch_status}`);
    return status;
  } catch (error) {
    console.error("[Payouts] Failed to check status:", error);
    throw error;
  }
}

/**
 * Manually trigger payout (admin only)
 */
export async function triggerManualPayout(amount?: number) {
  try {
    const payoutAmount = amount || (await getPendingPayoutAmount());

    if (payoutAmount === 0) {
      return { success: false, message: "No pending payouts" };
    }

    const batchId = `MANUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[Payouts] Triggering manual payout of $${payoutAmount.toFixed(2)}`);
    const payoutResponse = await processPayout(
      payoutAmount,
      "Manual payout request from OSINT Scanner Platform",
      batchId
    );

    const payoutId = payoutResponse.batch_header.payout_batch_id;

    // In production, save to database
    console.log(`[Payouts] Manual payout recorded: ${payoutId}`);

    return {
      success: true,
      message: `Manual payout of $${payoutAmount.toFixed(2)} initiated`,
      payoutId,
      amount: payoutAmount,
    };
  } catch (error) {
    console.error("[Payouts] Manual payout failed:", error);
    return {
      success: false,
      message: `Manual payout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
