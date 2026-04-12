/**
 * tRPC Procedures for Payout Management
 * Admin-only endpoints for managing automatic payouts
 */

import { router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getPayoutConfig,
  updatePayoutConfig,
  getPendingPayoutAmount,
  processAutomaticPayout,
  getPayoutHistory,
  checkPayoutStatus,
  triggerManualPayout,
} from "./automatic-payouts";

export const payoutRouter = router({
  /**
   * Get current payout configuration
   */
  getConfig: adminProcedure.query(async () => {
    try {
      const config = await getPayoutConfig();
      return {
        success: true,
        data: config,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get config",
      };
    }
  }),

  /**
   * Update payout configuration
   */
  updateConfig: adminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        minimumThreshold: z.number().min(0).optional(),
        payoutSchedule: z.enum(["daily", "weekly", "monthly", "manual"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updated = await updatePayoutConfig(input);
        return {
          success: true,
          data: updated,
          message: "Payout configuration updated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to update config",
        };
      }
    }),

  /**
   * Get pending payout amount
   */
  getPendingAmount: adminProcedure.query(async () => {
    try {
      const amount = await getPendingPayoutAmount();
      return {
        success: true,
        amount,
        formatted: `$${amount.toFixed(2)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get pending amount",
      };
    }
  }),

  /**
   * Process automatic payout
   */
  processAutomatic: adminProcedure.mutation(async () => {
    try {
      const result = await processAutomaticPayout();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process automatic payout",
      };
    }
  }),

  /**
   * Trigger manual payout
   */
  triggerManual: adminProcedure
    .input(
      z.object({
        amount: z.number().min(0.01).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await triggerManualPayout(input.amount);
        return result;
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to trigger manual payout",
        };
      }
    }),

  /**
   * Get payout history
   */
  getHistory: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getPayoutHistory(input.limit);
        return {
          success: true,
          data: history,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get history",
        };
      }
    }),

  /**
   * Check payout status
   */
  checkStatus: adminProcedure
    .input(
      z.object({
        payoutId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      try {
        const status = await checkPayoutStatus(input.payoutId);
        return {
          success: true,
          data: status,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to check status",
        };
      }
    }),
});
