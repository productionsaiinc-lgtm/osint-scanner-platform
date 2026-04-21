import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { sendTokenTriggerAlert, sendThreatAlert, sendDailyDigest } from "./email-alerts-service";
import { createRateLimiter, createPerUserRateLimiter, getUserQuota, updateQuotaUsage, getRemainingQuota } from "./rate-limiter";
import { registerWebhook, triggerWebhook, deleteWebhook, updateWebhookStatus, validateWebhookPayload } from "./webhook-service";
import { scanForVulnerabilities, getCVEDetails, getRemediationRecommendations } from "./advanced-vulnerability-scanner";

export const highPriorityFeaturesRouter = router({
  // Email Alerts
  alerts: router({
    sendTokenAlert: protectedProcedure
      .input(z.object({
        tokenId: z.string(),
        triggerData: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await sendTokenTriggerAlert(input.tokenId, input.triggerData);
          return { success: true, message: "Alert sent successfully" };
        } catch (error) {
          console.error("Failed to send token alert:", error);
          return { success: false, error: "Failed to send alert" };
        }
      }),

    sendThreatAlert: protectedProcedure
      .input(z.object({
        threatLevel: z.enum(["low", "medium", "high", "critical"]),
        threatDescription: z.string(),
        affectedAssets: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await sendThreatAlert(
            ctx.user.email || "",
            input.threatLevel,
            input.threatDescription,
            input.affectedAssets
          );
          return { success: true, message: "Threat alert sent" };
        } catch (error) {
          console.error("Failed to send threat alert:", error);
          return { success: false, error: "Failed to send threat alert" };
        }
      }),

    sendDailyDigest: protectedProcedure
      .input(z.object({
        summary: z.object({
          totalScans: z.number(),
          threatsDetected: z.number(),
          tokensTriggered: z.number(),
          criticalAlerts: z.number(),
          recentActivity: z.array(z.string()),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await sendDailyDigest(ctx.user.email || "", input.summary);
          return { success: true, message: "Daily digest sent" };
        } catch (error) {
          console.error("Failed to send daily digest:", error);
          return { success: false, error: "Failed to send digest" };
        }
      }),
  }),

  // Rate Limiting & Quotas
  quotas: router({
    getQuota: protectedProcedure
      .query(async ({ ctx }) => {
        const userTier = (ctx.user as any).tier || "free";
        const quota = getUserQuota(userTier);
        const remaining = getRemainingQuota(ctx.user.id.toString(), userTier);

        return {
          tier: userTier,
          dailyLimit: quota.dailyLimit,
          monthlyLimit: quota.monthlyLimit,
          concurrentRequests: quota.concurrentRequests,
          remaining,
          used: quota.dailyLimit - remaining,
        };
      }),

    updateUsage: protectedProcedure
      .input(z.object({
        usage: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userTier = (ctx.user as any).tier || "free";
        const allowed = updateQuotaUsage(ctx.user.id.toString(), userTier, input.usage);

        if (!allowed) {
          return { success: false, error: "Quota exceeded" };
        }

        return { success: true, remaining: getRemainingQuota(ctx.user.id.toString(), userTier) };
      }),
  }),

  // Webhooks
  webhooks: router({
    register: protectedProcedure
      .input(z.object({
        url: z.string().url(),
        events: z.array(z.enum(["scan.completed", "token.triggered", "threat.detected", "payment.completed", "alert.created"])),
        secret: z.string().min(32),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const webhook = await registerWebhook(
            ctx.user.id,
            input.url,
            input.events,
            input.secret
          );
          return { success: true, webhook };
        } catch (error) {
          console.error("Failed to register webhook:", error);
          return { success: false, error: "Failed to register webhook" };
        }
      }),

    delete: protectedProcedure
      .input(z.object({
        webhookId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await deleteWebhook(input.webhookId, ctx.user.id);
          return { success };
        } catch (error) {
          console.error("Failed to delete webhook:", error);
          return { success: false, error: "Failed to delete webhook" };
        }
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        webhookId: z.string(),
        active: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const success = await updateWebhookStatus(input.webhookId, input.active);
          return { success };
        } catch (error) {
          console.error("Failed to update webhook status:", error);
          return { success: false, error: "Failed to update webhook" };
        }
      }),

    trigger: protectedProcedure
      .input(z.object({
        event: z.enum(["scan.completed", "token.triggered", "threat.detected", "payment.completed", "alert.created"] as const),
        payload: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!validateWebhookPayload(input.event, input.payload)) {
            return { success: false, error: "Invalid payload for event type" };
          }

          await triggerWebhook(ctx.user.id, input.event, input.payload);
          return { success: true };
        } catch (error) {
          console.error("Failed to trigger webhook:", error);
          return { success: false, error: "Failed to trigger webhook" };
        }
      }),
  }),

  // Advanced Vulnerability Scanning
  vulnerabilityScanning: router({
    scan: protectedProcedure
      .input(z.object({
        target: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await scanForVulnerabilities(input.target);
          return { success: true, result };
        } catch (error) {
          console.error("Failed to scan for vulnerabilities:", error);
          return { success: false, error: "Scan failed" };
        }
      }),

    getCVEDetails: protectedProcedure
      .input(z.object({
        cveId: z.string(),
      }))
      .query(async ({ input }) => {
        try {
          const details = await getCVEDetails(input.cveId);
          return { success: true, details };
        } catch (error) {
          console.error("Failed to get CVE details:", error);
          return { success: false, error: "Failed to fetch CVE details" };
        }
      }),

    getRecommendations: protectedProcedure
      .input(z.object({
        vulnerabilities: z.array(z.object({
          id: z.string(),
          cveId: z.string(),
          title: z.string(),
          description: z.string(),
          severity: z.enum(["low", "medium", "high", "critical"] as const),
          cvssScore: z.number(),
          affectedVersions: z.array(z.string()),
          fixedVersion: z.string().optional(),
          publishedDate: z.date(),
          discoveredDate: z.date().optional(),
        })),
      }))
      .query(async ({ input }) => {
        try {
          const recommendations = getRemediationRecommendations(input.vulnerabilities);
          return { success: true, recommendations };
        } catch (error) {
          console.error("Failed to get recommendations:", error);
          return { success: false, error: "Failed to get recommendations" };
        }
      }),
  }),
});
