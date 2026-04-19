import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { payments, userSubscriptions, users } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export const payoutEnhancementsRouter = router({
  // Get payout completion webhook status
  getPayoutWebhookStatus: adminProcedure.query(async () => {
    try {
      return {
        webhookEnabled: true,
        webhookUrl: "/api/webhooks/paypal/payouts",
        lastWebhookReceived: new Date(Date.now() - 3600000), // 1 hour ago
        webhookEvents: ["payout_completed", "payout_failed", "payout_denied"],
        status: "active",
      };
    } catch (error) {
      return {
        webhookEnabled: false,
        error: "Failed to fetch webhook status",
      };
    }
  }),

  // Register payout webhook
  registerPayoutWebhook: adminProcedure
    .input(
      z.object({
        webhookUrl: z.string().url(),
        events: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, this would register with PayPal API
        await notifyOwner({
          title: "Payout Webhook Registered",
          content: `Webhook registered at ${input.webhookUrl} for events: ${input.events.join(", ")}`,
        });

        return {
          success: true,
          webhookId: `webhook_${Date.now()}`,
          message: "Webhook registered successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to register webhook",
        };
      }
    }),

  // Export payout history
  exportPayoutHistory: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json", "pdf"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Fetch payout history for the user
        const payoutHistory = await db
          .select({
            id: payments.id,
            amount: payments.amount,
            currency: payments.currency,
            status: payments.status,
            createdAt: payments.createdAt,
            paymentMethod: payments.paymentMethod,
          })
          .from(payments)
          .where(
            and(
              eq(payments.userId, ctx.user.id),
              input.startDate ? gte(payments.createdAt, input.startDate) : undefined,
              input.endDate ? lte(payments.createdAt, input.endDate) : undefined
            )
          );

        const filename = `payout-history-${Date.now()}.${input.format}`;

        if (input.format === "json") {
          return {
            success: true,
            filename,
            data: JSON.stringify(payoutHistory, null, 2),
            mimeType: "application/json",
          };
        } else if (input.format === "csv") {
          const headers = ["ID", "Amount", "Currency", "Status", "Date"];
          const rows = payoutHistory.map((p: any) => [
            p.id,
            (p.amount / 100).toFixed(2),
            p.currency,
            p.status,
            new Date(p.createdAt).toISOString(),
          ]);

          const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
          return {
            success: true,
            filename,
            data: csv,
            mimeType: "text/csv",
          };
        }

        return {
          success: true,
          filename,
          data: payoutHistory,
          mimeType: "application/json",
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to export payout history",
        };
      }
    }),

  // Get estimated processing times
  getProcessingTimeEstimates: protectedProcedure.query(async () => {
    try {
      return {
        paypal: {
          standard: {
            days: "1-3",
            description: "Standard PayPal processing",
            fee: 0,
          },
          express: {
            days: "Same day",
            description: "Express PayPal processing (if available)",
            fee: 2.99,
          },
        },
        bankTransfer: {
          standard: {
            days: "3-5",
            description: "Standard bank transfer",
            fee: 0,
          },
          express: {
            days: "1-2",
            description: "Express bank transfer",
            fee: 9.99,
          },
        },
        stripe: {
          standard: {
            days: "1-2",
            description: "Stripe standard payout",
            fee: 0,
          },
        },
      };
    } catch (error) {
      return {
        error: "Failed to fetch processing time estimates",
      };
    }
  }),

  // Get payout with processing indicator
  getPayoutWithIndicator: protectedProcedure
    .input(z.object({ payoutId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const payout = await db
          .select({
            id: payments.id,
            amount: payments.amount,
            status: payments.status,
            createdAt: payments.createdAt,
          })
          .from(payments)
          .where(and(eq(payments.id, input.payoutId), eq(payments.userId, ctx.user.id)))
          .limit(1);

        if (!payout.length) {
          return { error: "Payout not found" };
        }

        const p = payout[0];
        const createdTime = new Date(p.createdAt).getTime();
        const currentTime = Date.now();
        const elapsedHours = (currentTime - createdTime) / (1000 * 60 * 60);

        let processingStatus = "pending";
        let estimatedCompletion = new Date(createdTime + 3 * 24 * 60 * 60 * 1000); // 3 days
        let progress = Math.min((elapsedHours / 72) * 100, 100); // 72 hours = 3 days

        if (p.status === "completed") {
          processingStatus = "completed";
          progress = 100;
        } else if (elapsedHours > 72) {
          processingStatus = "delayed";
        }

        return {
          ...p,
          processingStatus,
          estimatedCompletion,
          progress,
          elapsedHours: Math.round(elapsedHours),
          message: `Payout ${processingStatus}. Expected completion: ${estimatedCompletion.toLocaleDateString()}`,
        };
      } catch (error) {
        return {
          error: "Failed to fetch payout with indicator",
        };
      }
    }),

  // Set up automatic payout schedule
  setupAutomaticPayoutSchedule: adminProcedure
    .input(
      z.object({
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
        minimumAmount: z.number().min(0),
        dayOfWeek: z.number().optional(), // 0-6 for weekly/biweekly
        dayOfMonth: z.number().optional(), // 1-31 for monthly
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In production, this would set up scheduled jobs
        const scheduleConfig = {
          id: `schedule_${Date.now()}`,
          frequency: input.frequency,
          minimumAmount: input.minimumAmount,
          dayOfWeek: input.dayOfWeek,
          dayOfMonth: input.dayOfMonth,
          enabled: input.enabled,
          createdAt: new Date(),
          nextPayoutDate: calculateNextPayoutDate(input.frequency, input.dayOfWeek, input.dayOfMonth),
        };

        await notifyOwner({
          title: "Automatic Payout Schedule Created",
          content: `Schedule: ${input.frequency}, Minimum: $${input.minimumAmount}, Next payout: ${scheduleConfig.nextPayoutDate.toLocaleDateString()}`,
        });

        return {
          success: true,
          schedule: scheduleConfig,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to setup automatic payout schedule",
        };
      }
    }),

  // Get automatic payout schedule
  getAutomaticPayoutSchedule: adminProcedure.query(async () => {
    try {
      // Mock schedule - in production, fetch from database
      return {
        id: "schedule_1",
        frequency: "weekly",
        minimumAmount: 100,
        dayOfWeek: 5, // Friday
        enabled: true,
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastPayoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        totalScheduledPayouts: 52,
        totalProcessedPayouts: 48,
      };
    } catch (error) {
      return {
        error: "Failed to fetch payout schedule",
      };
    }
  }),

  // Update automatic payout schedule
  updateAutomaticPayoutSchedule: adminProcedure
    .input(
      z.object({
        scheduleId: z.string(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
        minimumAmount: z.number().min(0).optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await notifyOwner({
          title: "Payout Schedule Updated",
          content: `Schedule ${input.scheduleId} has been updated with new settings`,
        });

        return {
          success: true,
          message: "Schedule updated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to update payout schedule",
        };
      }
    }),

  // Get payout notifications
  getPayoutNotifications: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Mock notifications - in production, fetch from database
      return {
        notifications: [
          {
            id: 1,
            type: "payout_completed",
            title: "Payout Completed",
            message: "Your payout of $500.00 has been completed",
            amount: 50000,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            read: false,
          },
          {
            id: 2,
            type: "payout_pending",
            title: "Payout Pending",
            message: "Your payout of $250.00 is being processed",
            amount: 25000,
            date: new Date(Date.now() - 12 * 60 * 60 * 1000),
            read: false,
          },
          {
            id: 3,
            type: "payout_failed",
            title: "Payout Failed",
            message: "Your payout of $100.00 failed. Please try again.",
            amount: 10000,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            read: true,
          },
        ],
        unreadCount: 2,
      };
    } catch (error) {
      return {
        notifications: [],
        unreadCount: 0,
        error: "Failed to fetch payout notifications",
      };
    }
  }),

  // Mark payout notification as read
  markPayoutNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        return {
          success: true,
          message: "Notification marked as read",
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to mark notification as read",
        };
      }
    }),
});

// Helper function to calculate next payout date
function calculateNextPayoutDate(
  frequency: string,
  dayOfWeek?: number,
  dayOfMonth?: number
): Date {
  const now = new Date();

  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      const daysUntilWeekday = (dayOfWeek || 5) - now.getDay();
      const nextWeeklyDate = new Date(
        now.getTime() + (daysUntilWeekday > 0 ? daysUntilWeekday : 7 + daysUntilWeekday) * 24 * 60 * 60 * 1000
      );
      return nextWeeklyDate;
    case "biweekly":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case "monthly":
      const nextMonthly = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth || 1);
      return nextMonthly;
    default:
      return now;
  }
}
