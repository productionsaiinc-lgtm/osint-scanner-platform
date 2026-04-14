/**
 * Canary Token tRPC Router
 * Provides procedures for managing and tracking canary tokens
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createCanaryToken,
  logCanaryTokenEvent,
  sendCanaryTokenAlert,
  getCanaryTokenStats,
  validateCanaryToken,
  formatCanaryTokenForDisplay,
  CanaryToken,
  CanaryTokenEvent,
} from "./canary-token-service";

// In-memory storage for demo (replace with database in production)
const canaryTokens: Map<string, CanaryToken> = new Map();
const canaryTokenEvents: CanaryTokenEvent[] = [];

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
      const token = await createCanaryToken(input.name, input.email, input.tokenType, input.description);

      // Store token
      canaryTokens.set(token.id, token);

      // Log creation
      console.log(`[Canary Token] Created: ${token.name} (${token.id})`);

      return {
        success: true,
        token: formatCanaryTokenForDisplay(token),
        message: `Canary token "${token.name}" created successfully`,
      };
    }),

  /**
   * List all canary tokens for the user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const tokens: CanaryToken[] = [];
    canaryTokens.forEach((token) => tokens.push(token));
    const stats = await getCanaryTokenStats(tokens);

    return {
      tokens: tokens.map(formatCanaryTokenForDisplay),
      stats,
    };
  }),

  /**
   * Get details of a specific canary token
   */
  getById: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .query(async ({ input }) => {
      const token = canaryTokens.get(input.tokenId);

      if (!token) {
        throw new Error("Canary token not found");
      }

      return {
        token: formatCanaryTokenForDisplay(token),
        events: canaryTokenEvents.filter((e) => e.token_id === token.id),
      };
    }),

  /**
   * Trigger a canary token (log event and send alert)
   */
  trigger: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        ip: z.string(),
        userAgent: z.string(),
        referer: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Find token by value
      let targetToken: CanaryToken | undefined;
      canaryTokens.forEach((token) => {
        if (token.token === input.token) {
          targetToken = token;
        }
      });

      if (!targetToken) {
        throw new Error("Invalid canary token");
      }

      if (!targetToken.is_active) {
        throw new Error("Canary token is not active");
      }

      // Log the event
      const event = await logCanaryTokenEvent(targetToken.id, input.token, input.ip, input.userAgent, input.referer);
      canaryTokenEvents.push(event);

      // Update trigger count
      targetToken.trigger_count += 1;
      targetToken.last_triggered = new Date().toISOString();

      // Send email alert
      const alert = await sendCanaryTokenAlert(targetToken, event);

      console.log(`[Canary Token] Triggered: ${targetToken.name}`);
      console.log(`[Canary Token] Alert sent to ${targetToken.email}`);

      return {
        success: true,
        event,
        alert,
        message: `Canary token triggered and alert sent to ${targetToken.email}`,
      };
    }),

  /**
   * Get events for a canary token
   */
  getEvents: protectedProcedure
    .input(z.object({ tokenId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const events = canaryTokenEvents
        .filter((e) => e.token_id === input.tokenId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, input.limit);

      return events;
    }),

  /**
   * Delete a canary token
   */
  delete: protectedProcedure
    .input(z.object({ tokenId: z.string() }))
    .mutation(async ({ input }) => {
      const token = canaryTokens.get(input.tokenId);

      if (!token) {
        throw new Error("Canary token not found");
      }

      canaryTokens.delete(input.tokenId);

      // Also delete associated events
      const eventIndices = canaryTokenEvents
        .map((e, i) => (e.token_id === input.tokenId ? i : -1))
        .filter((i) => i !== -1)
        .reverse();

      for (const i of eventIndices) {
        canaryTokenEvents.splice(i, 1);
      }

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
    .mutation(async ({ input }) => {
      const token = canaryTokens.get(input.tokenId);

      if (!token) {
        throw new Error("Canary token not found");
      }

      token.is_active = !token.is_active;

      console.log(`[Canary Token] ${token.is_active ? "Enabled" : "Disabled"}: ${token.name}`);

      return {
        success: true,
        token: formatCanaryTokenForDisplay(token),
        message: `Canary token "${token.name}" is now ${token.is_active ? "active" : "inactive"}`,
      };
    }),

  /**
   * Get statistics
   */
  getStats: protectedProcedure.query(async () => {
    const tokens: CanaryToken[] = [];
    canaryTokens.forEach((token) => tokens.push(token));
    const stats = await getCanaryTokenStats(tokens);

    return stats;
  }),
});
