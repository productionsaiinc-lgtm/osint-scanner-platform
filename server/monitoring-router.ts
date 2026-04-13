import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { monitoredAssets, alertRules, alerts, monitoringScanHistory } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { 
  getAssetsToScan, 
  executeScanForAsset, 
  getUnreadAlerts, 
  markAlertAsRead, 
  markAlertAsResolved 
} from "./monitoring-service";

export const monitoringRouter = router({
  // Get all monitored assets for the current user
  listAssets: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, ctx.user.id));
      
      return assets.map((asset: any) => ({
        ...asset,
        isActive: asset.isActive === 1,
      }));
    }),

  // Create a new monitored asset
  createAsset: protectedProcedure
    .input(z.object({
      assetType: z.enum(["domain", "ip", "service"]),
      assetValue: z.string().min(1),
      scanFrequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(monitoredAssets).values({
        userId: ctx.user.id,
        assetType: input.assetType,
        assetValue: input.assetValue,
        scanFrequency: input.scanFrequency,
        description: input.description || null,
        isActive: 1,
        lastScanned: null,
        nextScan: new Date(),
        createdAt: new Date(),
      });

      // Get the created asset
      const created = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, ctx.user.id))
        .orderBy((t: any) => t.id)
        .then((rows: any[]) => rows[rows.length - 1]);

      return {
        success: true,
        assetId: created?.id,
      };
    }),

  // Update a monitored asset
  updateAsset: protectedProcedure
    .input(z.object({
      assetId: z.number(),
      scanFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Asset not found or unauthorized");
      }

      const updates: any = {};
      if (input.scanFrequency) updates.scanFrequency = input.scanFrequency;
      if (input.description !== undefined) updates.description = input.description;
      if (input.isActive !== undefined) updates.isActive = input.isActive ? 1 : 0;

      await db
        .update(monitoredAssets)
        .set(updates)
        .where(eq(monitoredAssets.id, input.assetId));

      return { success: true };
    }),

  // Delete a monitored asset
  deleteAsset: protectedProcedure
    .input(z.object({ assetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Asset not found or unauthorized");
      }

      await db
        .delete(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId));

      return { success: true };
    }),

  // Get alert rules for an asset
  getAlertRules: protectedProcedure
    .input(z.object({ assetId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Asset not found or unauthorized");
      }

      const rules = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.monitoredAssetId, input.assetId));

      return rules.map((rule: any) => ({
        ...rule,
        isEnabled: rule.isEnabled === 1,
      }));
    }),

  // Update alert rule
  updateAlertRule: protectedProcedure
    .input(z.object({
      ruleId: z.number(),
      isEnabled: z.boolean().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      notificationMethod: z.enum(["email", "push", "both"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership by checking asset
      const rule = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.id, input.ruleId))
        .then((rows: any[]) => rows[0]);

      if (!rule) {
        throw new Error("Rule not found");
      }

      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, rule.monitoredAssetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const updates: any = {};
      if (input.isEnabled !== undefined) updates.isEnabled = input.isEnabled ? 1 : 0;
      if (input.severity) updates.severity = input.severity;
      if (input.notificationMethod) updates.notificationMethod = input.notificationMethod;

      await db
        .update(alertRules)
        .set(updates)
        .where(eq(alertRules.id, input.ruleId));

      return { success: true };
    }),

  // Get all alerts for user
  listAlerts: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, ctx.user.id));

      if (input.unreadOnly) {
        query = db
          .select()
          .from(alerts)
          .where(
            and(
              eq(alerts.userId, ctx.user.id),
              eq(alerts.isRead, 0)
            )
          );
      }

      const results = await query.limit(input.limit);

      return results.map((alert: any) => ({
        ...alert,
        isRead: alert.isRead === 1,
        isResolved: alert.isResolved === 1,
        details: alert.details ? JSON.parse(alert.details) : null,
      }));
    }),

  // Mark alert as read
  markAlertRead: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const alert = await db
        .select()
        .from(alerts)
        .where(eq(alerts.id, input.alertId))
        .then((rows: any[]) => rows[0]);

      if (!alert || alert.userId !== ctx.user.id) {
        throw new Error("Alert not found or unauthorized");
      }

      await markAlertAsRead(input.alertId);
      return { success: true };
    }),

  // Mark alert as resolved
  markAlertResolved: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const alert = await db
        .select()
        .from(alerts)
        .where(eq(alerts.id, input.alertId))
        .then((rows: any[]) => rows[0]);

      if (!alert || alert.userId !== ctx.user.id) {
        throw new Error("Alert not found or unauthorized");
      }

      await markAlertAsResolved(input.alertId);
      return { success: true };
    }),

  // Get scan history for an asset
  getScanHistory: protectedProcedure
    .input(z.object({
      assetId: z.number(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Asset not found or unauthorized");
      }

      const history = await db
        .select()
        .from(monitoringScanHistory)
        .where(eq(monitoringScanHistory.monitoredAssetId, input.assetId))
        .limit(input.limit);

      return history.map((scan: any) => ({
        ...scan,
        changeDetected: scan.changeDetected === 1,
        previousResults: scan.previousResults ? JSON.parse(scan.previousResults) : null,
        currentResults: scan.currentResults ? JSON.parse(scan.currentResults) : null,
        changeDetails: scan.changeDetails ? JSON.parse(scan.changeDetails) : null,
      }));
    }),

  // Get dashboard stats
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, ctx.user.id));

      const unreadAlerts = await getUnreadAlerts(ctx.user.id);

      const recentAlerts = await db
        .select()
        .from(alerts)
        .where(
          and(
            eq(alerts.userId, ctx.user.id),
            eq(alerts.isResolved, 0)
          )
        )
        .limit(5);

      return {
        totalAssets: assets.length,
        activeAssets: assets.filter((a: any) => a.isActive === 1).length,
        unreadAlerts: unreadAlerts.length,
        unresolvedAlerts: recentAlerts.length,
      };
    }),

  // Manually trigger scan for an asset
  triggerScan: protectedProcedure
    .input(z.object({ assetId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify ownership
      const asset = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.id, input.assetId))
        .then((rows: any[]) => rows[0]);

      if (!asset || asset.userId !== ctx.user.id) {
        throw new Error("Asset not found or unauthorized");
      }

      const result = await executeScanForAsset(input.assetId);
      return result;
    }),
});
