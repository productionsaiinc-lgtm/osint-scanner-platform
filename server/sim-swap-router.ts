/**
 * tRPC router for SIM swap detection
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { detectSimSwap } from "./sim-swap-detector";

export const simSwapRouter = router({
  /**
   * Detect if a phone number has been SIM swapped
   */
  detectSimSwap: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, "Invalid phone number"),
        carrier: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        // Normalize phone number
        const normalizedPhone = input.phoneNumber
          .replace(/\D/g, "")
          .slice(-10);

        if (normalizedPhone.length < 10) {
          throw new Error("Invalid phone number format");
        }

        // Detect SIM swap
        const result = await detectSimSwap(
          ctx.user.id,
          input.phoneNumber,
          input.carrier || "Unknown"
        );

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("[SIM Swap Router] Detection error:", error);
        throw error;
      }
    }),

  /**
   * Get detection history for current user
   */
  getHistory: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      // This would be implemented in sim-swap-db.ts
      // For now, return empty array as placeholder
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error("[SIM Swap Router] History fetch error:", error);
      throw error;
    }
  }),
});
