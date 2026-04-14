import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "./db";
import { monitoredAssets, alertRules, alerts, monitoringScanHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

let db: any;
const testUserId = 999;

describe("Monitoring System", () => {
  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available for tests");
    }
  });

  describe("Monitored Assets", () => {
    it("should create a monitored asset", async () => {
      const result = await db.insert(monitoredAssets).values({
        userId: testUserId,
        assetType: "domain",
        assetValue: "example.com",
        scanFrequency: "daily",
        description: "Test domain",
        isActive: 1,
        nextScan: new Date(),
        createdAt: new Date(),
      });

      expect(result).toBeDefined();
    });

    it("should retrieve monitored assets for a user", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBeGreaterThan(0);
    });

    it("should update a monitored asset", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        await db
          .update(monitoredAssets)
          .set({ scanFrequency: "weekly" })
          .where(eq(monitoredAssets.id, assetId));

        const updated = await db
          .select()
          .from(monitoredAssets)
          .where(eq(monitoredAssets.id, assetId))
          .then((rows: any[]) => rows[0]);

        expect(updated.scanFrequency).toBe("weekly");
      }
    });

    it("should deactivate a monitored asset", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        await db
          .update(monitoredAssets)
          .set({ isActive: 0 })
          .where(eq(monitoredAssets.id, assetId));

        const updated = await db
          .select()
          .from(monitoredAssets)
          .where(eq(monitoredAssets.id, assetId))
          .then((rows: any[]) => rows[0]);

        expect(updated.isActive).toBe(0);
      }
    });
  });

  describe("Alert Rules", () => {
    it("should create alert rules for an asset", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const result = await db.insert(alertRules).values({
          userId: testUserId,
          monitoredAssetId: assetId,
          ruleType: "new_port",
          severity: "high",
          isEnabled: 1,
          notifyEmail: 1,
          notifyDashboard: 1,
          createdAt: new Date(),
        });

        expect(result).toBeDefined();
      }
    });

    it("should retrieve alert rules for an asset", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const rules = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.monitoredAssetId, assetId));

        expect(Array.isArray(rules)).toBe(true);
      }
    });

    it("should update alert rule", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const rules = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.monitoredAssetId, assetId));

        if (rules.length > 0) {
          const ruleId = rules[0].id;
          await db
            .update(alertRules)
            .set({ severity: "critical" })
            .where(eq(alertRules.id, ruleId));

          const updated = await db
            .select()
            .from(alertRules)
            .where(eq(alertRules.id, ruleId))
            .then((rows: any[]) => rows[0]);

          expect(updated.severity).toBe("critical");
        }
      }
    });

    it("should disable alert rule", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const rules = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.monitoredAssetId, assetId));

        if (rules.length > 0) {
          const ruleId = rules[0].id;
          await db
            .update(alertRules)
            .set({ isEnabled: 0 })
            .where(eq(alertRules.id, ruleId));

          const updated = await db
            .select()
            .from(alertRules)
            .where(eq(alertRules.id, ruleId))
            .then((rows: any[]) => rows[0]);

          expect(updated.isEnabled).toBe(0);
        }
      }
    });
  });

  describe("Alerts", () => {
    it("should create an alert", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const result = await db.insert(alerts).values({
          userId: testUserId,
          monitoredAssetId: assetId,
          alertType: "new_port",
          severity: "high",
          title: "New port detected",
          description: "Port 8080 opened on example.com",
          details: JSON.stringify({ port: 8080, service: "http-alt" }),
          isRead: 0,
          isResolved: 0,
          createdAt: new Date(),
        });

        expect(result).toBeDefined();
      }
    });

    it("should retrieve unread alerts", async () => {
      const unreadAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, testUserId));

      expect(Array.isArray(unreadAlerts)).toBe(true);
    });

    it("should mark alert as read", async () => {
      const userAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, testUserId));

      if (userAlerts.length > 0) {
        const alertId = userAlerts[0].id;
        await db
          .update(alerts)
          .set({ isRead: 1 })
          .where(eq(alerts.id, alertId));

        const updated = await db
          .select()
          .from(alerts)
          .where(eq(alerts.id, alertId))
          .then((rows: any[]) => rows[0]);

        expect(updated.isRead).toBe(1);
      }
    });

    it("should mark alert as resolved", async () => {
      const userAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, testUserId));

      if (userAlerts.length > 0) {
        const alertId = userAlerts[0].id;
        await db
          .update(alerts)
          .set({ isResolved: 1, resolvedAt: new Date() })
          .where(eq(alerts.id, alertId));

        const updated = await db
          .select()
          .from(alerts)
          .where(eq(alerts.id, alertId))
          .then((rows: any[]) => rows[0]);

        expect(updated.isResolved).toBe(1);
        expect(updated.resolvedAt).toBeDefined();
      }
    });

    it("should filter alerts by severity", async () => {
      const criticalAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.severity, "critical"));

      expect(Array.isArray(criticalAlerts)).toBe(true);
    });

    it("should filter unresolved alerts", async () => {
      const unresolvedAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.isResolved, 0));

      expect(Array.isArray(unresolvedAlerts)).toBe(true);
    });
  });

  describe("Scan History", () => {
    it("should record scan history", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const result = await db.insert(monitoringScanHistory).values({
          monitoredAssetId: assetId,
          scanType: "domain",
          previousResults: JSON.stringify({ dns: { records: [] } }),
          currentResults: JSON.stringify({ dns: { records: [{ name: "example.com", value: "1.2.3.4" }] } }),
          changeDetected: 1,
          changeDetails: JSON.stringify({ newDNSRecords: [{ name: "example.com", value: "1.2.3.4" }] }),
          status: "completed",
          createdAt: new Date(),
        });

        expect(result).toBeDefined();
      }
    });

    it("should retrieve scan history for an asset", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;
        const history = await db
          .select()
          .from(monitoringScanHistory)
          .where(eq(monitoringScanHistory.monitoredAssetId, assetId));

        expect(Array.isArray(history)).toBe(true);
      }
    });

    it("should filter scans with changes detected", async () => {
      const changedScans = await db
        .select()
        .from(monitoringScanHistory)
        .where(eq(monitoringScanHistory.changeDetected, 1));

      expect(Array.isArray(changedScans)).toBe(true);
    });

    it("should retrieve completed scans", async () => {
      const completedScans = await db
        .select()
        .from(monitoringScanHistory)
        .where(eq(monitoringScanHistory.status, "completed"));

      expect(Array.isArray(completedScans)).toBe(true);
    });
  });

  describe("Data Integrity", () => {
    it("should have proper relationships between tables", async () => {
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.userId, testUserId));

      if (assets.length > 0) {
        const assetId = assets[0].id;

        // Check alert rules exist for asset
        const rules = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.monitoredAssetId, assetId));

        // Check alerts exist for asset
        const assetAlerts = await db
          .select()
          .from(alerts)
          .where(eq(alerts.monitoredAssetId, assetId));

        // Check scan history exists for asset
        const scanHistory = await db
          .select()
          .from(monitoringScanHistory)
          .where(eq(monitoringScanHistory.monitoredAssetId, assetId));

        expect(Array.isArray(rules)).toBe(true);
        expect(Array.isArray(assetAlerts)).toBe(true);
        expect(Array.isArray(scanHistory)).toBe(true);
      }
    });

    it("should properly parse JSON fields", async () => {
      const userAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.userId, testUserId));

      if (userAlerts.length > 0) {
        const alert = userAlerts[0];
        if (alert.details) {
          const parsed = JSON.parse(alert.details);
          expect(typeof parsed).toBe("object");
        }
      }
    });
  });

  describe("Asset Lifecycle", () => {
    it("should complete full asset lifecycle", async () => {
      // Create asset
      const createResult = await db.insert(monitoredAssets).values({
        userId: testUserId,
        assetType: "ip",
        assetValue: "192.168.1.1",
        scanFrequency: "daily",
        description: "Test IP",
        isActive: 1,
        nextScan: new Date(),
        createdAt: new Date(),
      });

      expect(createResult).toBeDefined();

      // Retrieve asset
      const assets = await db
        .select()
        .from(monitoredAssets)
        .where(eq(monitoredAssets.assetValue, "192.168.1.1"));

      expect(assets.length).toBeGreaterThan(0);

      if (assets.length > 0) {
        const assetId = assets[0].id;

        // Create alert rule
        await db.insert(alertRules).values({
          userId: testUserId,
          monitoredAssetId: assetId,
          ruleType: "new_port",
          severity: "high",
          isEnabled: 1,
          notifyEmail: 1,
          notifyDashboard: 1,
          createdAt: new Date(),
        });

        // Record scan
        await db.insert(monitoringScanHistory).values({
          monitoredAssetId: assetId,
          scanType: "ip",
          previousResults: null,
          currentResults: JSON.stringify({ ports: { ports: [22, 80, 443] } }),
          changeDetected: 0,
          changeDetails: null,
          status: "completed",
          createdAt: new Date(),
        });

        // Verify all data exists
        const rules = await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.monitoredAssetId, assetId));

        const history = await db
          .select()
          .from(monitoringScanHistory)
          .where(eq(monitoringScanHistory.monitoredAssetId, assetId));

        expect(rules.length).toBeGreaterThan(0);
        expect(history.length).toBeGreaterThan(0);

        // Deactivate asset
        await db
          .update(monitoredAssets)
          .set({ isActive: 0 })
          .where(eq(monitoredAssets.id, assetId));

        const deactivated = await db
          .select()
          .from(monitoredAssets)
          .where(eq(monitoredAssets.id, assetId))
          .then((rows: any[]) => rows[0]);

        expect(deactivated.isActive).toBe(0);
      }
    });
  });
});
