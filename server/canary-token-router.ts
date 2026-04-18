/**
 * Canary Token tRPC Router
 * Provides procedures for managing and tracking canary tokens
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createCanaryToken, getCanaryTokens, getCanaryToken, updateCanaryToken, deleteCanaryToken, getCanaryTokenStats } from "./db";
import { randomBytes } from "crypto";

export const canaryTokenRouter = router({
  /**
   * Create a new canary token
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Token name is required"),
        email: z.string().email("Valid email is required"),
        description: z.string().optional(),
        tokenType: z.enum(["page_view", "resource", "form_submission", "api_call"]).default("page_view"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tokenId = randomBytes(16).toString("hex");
      const tokenUrl = `${process.env.VITE_APP_URL || "https://osintscan-fftqerzj.manus.space"}/api/canary/${tokenId}`;
      
      const token = await createCanaryToken({
        id: tokenId,
        userId: ctx.user.id,
        name: input.name,
        email: input.email,
        description: input.description,
        tokenType: input.tokenType,
        tokenUrl,
        status: "Active",
        notificationEmail: input.email,
      });

      if (!token) throw new Error("Failed to create token");

      console.log(`[Canary Token] Created: ${token.name} (${token.id})`);

      return {
        success: true,
        token,
        message: `Canary token "${token.name}" created successfully`,
      };
    }),

  /**
   * List all canary tokens for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const tokens = await getCanaryTokens(ctx.user.id);
    const stats = await getCanaryTokenStats(ctx.user.id);

    return {
      tokens: tokens.map(t => ({
        id: t.id,
        name: t.name,
        type: t.tokenType,
        status: t.status,
        url: t.tokenUrl,
        triggers: t.triggerCount || 0,
        created: t.createdAt?.toLocaleDateString() || "",
      })),
      stats,
    };
  }),

  /**
   * Get details of a specific canary token
   */
  getById: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .query(async ({ input, ctx }) => {
      const token = await getCanaryToken(input.tokenId, ctx.user.id);

      if (!token) {
        throw new Error("Canary token not found");
      }

      return {
        token,
      };
    }),

  /**
   * Delete a canary token
   */
  delete: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = await getCanaryToken(input.tokenId, ctx.user.id);

      if (!token) {
        throw new Error("Canary token not found");
      }

      await deleteCanaryToken(input.tokenId);

      console.log(`[Canary Token] Deleted: ${token.name}`);

      return {
        success: true,
        message: `Canary token "${token.name}" deleted successfully`,
      };
    }),

  /**
   * Disable/Enable a canary token
   */
  toggle: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const token = await getCanaryToken(input.tokenId, ctx.user.id);

      if (!token) {
        throw new Error("Canary token not found");
      }

      const newStatus = token.status === "Active" ? "Inactive" : "Active";
      await updateCanaryToken(input.tokenId, { status: newStatus });

      console.log(`[Canary Token] ${newStatus}: ${token.name}`);

      return {
        success: true,
        status: newStatus,
        message: `Canary token "${token.name}" is now ${newStatus.toLowerCase()}`,
      };
    }),

  /**
   * Get statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getCanaryTokenStats(ctx.user.id);
    return stats;
  }),
});
