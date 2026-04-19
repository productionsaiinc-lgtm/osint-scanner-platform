import { getDb } from "./db";
import { monitoredAssets, monitoringScanHistory, alerts, alertRules } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";

let db: any;

// Placeholder scan functions - replace with actual implementations
async function executeNetworkScan(target: string) {
  return { ports: { ports: [] }, ping: { time: 0 } };
}

async function executeDomainScan(target: string) {
  return { dns: { records: [] }, subdomains: { subdomains: [] } };
}

/**
 * Monitoring Service - Handles scheduled scans and change detection
 */

interface ScanResult {
  ports?: { ports: any[] };
  dns?: { records: any[] };
  subdomains?: { subdomains: any[] };
  [key: string]: any;
}

/**
 * Get all active monitored assets that need to be scanned
 */
export async function getAssetsToScan() {
  if (!db) db = await getDb();
  const now = new Date();
  
  const assets = await db
    .select()
    .from(monitoredAssets)
    .where(
      and(
        eq(monitoredAssets.isActive, 1),
        lt(monitoredAssets.nextScan, now)
      )
    );

  return assets;
}

/**
 * Execute scan for a monitored asset
 */
export async function executeScanForAsset(assetId: number) {
  if (!db) db = await getDb();
  try {
    const asset = await db
      .select()
      .from(monitoredAssets)
      .where(eq(monitoredAssets.id, assetId))
      .then((rows: any[]) => rows[0]);

    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }

    // Get previous scan results for comparison
    const previousScan = await db
      .select()
      .from(monitoringScanHistory)
      .where(eq(monitoringScanHistory.monitoredAssetId, assetId))
      .orderBy((t: any) => t.createdAt)
      .then((rows: any[]) => rows[rows.length - 1]);

    let currentResults: ScanResult = {};

    // Execute appropriate scan based on asset type
    if (asset.assetType === "domain") {
      currentResults = await executeDomainScan(asset.assetValue);
    } else if (asset.assetType === "ip") {
      currentResults = await executeNetworkScan(asset.assetValue);
    } else if (asset.assetType === "service") {
      currentResults = await executeNetworkScan(asset.assetValue);
    }

    // Detect changes
    const changeDetected = previousScan 
      ? JSON.stringify(previousScan.currentResults) !== JSON.stringify(currentResults)
      : false;

    const changeDetails = changeDetected 
      ? detectChanges(
          JSON.parse(previousScan?.currentResults || "{}"),
          currentResults
        )
      : null;

    // Record scan history
    await db.insert(monitoringScanHistory).values({
      monitoredAssetId: assetId,
      scanType: asset.assetType,
      previousResults: previousScan?.currentResults || null,
      currentResults: JSON.stringify(currentResults),
      changeDetected: changeDetected ? 1 : 0,
      changeDetails: changeDetails ? JSON.stringify(changeDetails) : null,
      status: "completed",
    });

    // Generate alerts if changes detected
    if (changeDetected) {
      await generateAlertsForChanges(asset, changeDetails || {});
    }

    // Update last scanned and next scan time
    const nextScanDate = calculateNextScanDate(asset.scanFrequency);
    await db
      .update(monitoredAssets)
      .set({
        lastScanned: new Date(),
        nextScan: nextScanDate,
      })
      .where(eq(monitoredAssets.id, assetId));

    return {
      success: true,
      changeDetected,
      alertsGenerated: changeDetected,
    };
  } catch (error) {
    console.error(`Error scanning asset ${assetId}:`, error);
    
    // Record failed scan
    await db.insert(monitoringScanHistory).values({
      monitoredAssetId: assetId,
      scanType: "unknown",
      previousResults: null,
      currentResults: null,
      changeDetected: 0,
      changeDetails: null,
      status: "error",
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Detect changes between previous and current scan results
 */
function detectChanges(previous: ScanResult, current: ScanResult): Record<string, any> {
  const changes: Record<string, any> = {};

  // Check for new ports
  if (current.ports?.ports && previous?.ports?.ports) {
    const newPorts = current.ports.ports.filter(
      (p: any) => !previous.ports!.ports.find((pp: any) => pp.port === p.port)
    );
    if (newPorts.length > 0) {
      changes.newPorts = newPorts;
    }
  }

  // Check for closed ports
  if (current.ports?.ports && previous?.ports?.ports) {
    const closedPorts = previous.ports!.ports.filter(
      (p: any) => !current.ports!.ports.find((cp: any) => cp.port === p.port)
    );
    if (closedPorts.length > 0) {
      changes.closedPorts = closedPorts;
    }
  }

  // Check for DNS changes
  if (current.dns?.records && previous?.dns?.records) {
    const newRecords = current.dns.records.filter(
      (r: any) => !previous.dns!.records.find((pr: any) => pr.name === r.name && pr.value === r.value)
    );
    if (newRecords.length > 0) {
      changes.newDNSRecords = newRecords;
    }
  }

  // Check for new subdomains
  if (current.subdomains?.subdomains && previous?.subdomains?.subdomains) {
    const newSubdomains = current.subdomains.subdomains.filter(
      (s: any) => !previous.subdomains!.subdomains.includes(s)
    );
    if (newSubdomains.length > 0) {
      changes.newSubdomains = newSubdomains;
    }
  }

  return changes;
}

/**
 * Generate alerts based on detected changes
 */
async function generateAlertsForChanges(
  asset: any,
  changes: Record<string, any>
) {
  const alerts_to_create = [];

  // Get alert rules for this asset
  const rules = await db
    .select()
    .from(alertRules)
    .where(eq(alertRules.monitoredAssetId, asset.id)) as any[];

  // Check for new ports
  if (changes.newPorts && changes.newPorts.length > 0) {
    const rule = rules.find((r: any) => r.ruleType === "new_port");
    if (rule?.isEnabled) {
      alerts_to_create.push({
        userId: asset.userId,
        monitoredAssetId: asset.id,
        alertType: "new_port",
        severity: rule.severity,
        title: `New open ports detected on ${asset.assetValue}`,
        description: `${changes.newPorts.length} new port(s) found: ${changes.newPorts.map((p: any) => p.port).join(", ")}`,
        details: JSON.stringify(changes.newPorts),
      });
    }
  }

  // Check for DNS changes
  if (changes.newDNSRecords && changes.newDNSRecords.length > 0) {
    const rule = rules.find((r: any) => r.ruleType === "dns_change");
    if (rule?.isEnabled) {
      alerts_to_create.push({
        userId: asset.userId,
        monitoredAssetId: asset.id,
        alertType: "dns_change",
        severity: rule.severity,
        title: `DNS records changed for ${asset.assetValue}`,
        description: `${changes.newDNSRecords.length} new DNS record(s) detected`,
        details: JSON.stringify(changes.newDNSRecords),
      });
    }
  }

  // Check for new subdomains
  if (changes.newSubdomains && changes.newSubdomains.length > 0) {
    const rule = rules.find((r: any) => r.ruleType === "subdomain_found");
    if (rule?.isEnabled) {
      alerts_to_create.push({
        userId: asset.userId,
        monitoredAssetId: asset.id,
        alertType: "subdomain_found",
        severity: rule.severity,
        title: `New subdomains discovered for ${asset.assetValue}`,
        description: `${changes.newSubdomains.length} new subdomain(s) found: ${changes.newSubdomains.join(", ")}`,
        details: JSON.stringify(changes.newSubdomains),
      });
    }
  }

  // Insert all alerts
  if (alerts_to_create.length > 0) {
    await db.insert(alerts).values(alerts_to_create);
  }
}

/**
 * Calculate next scan date based on frequency
 */
function calculateNextScanDate(frequency: string): Date {
  const now = new Date();
  const nextScan = new Date(now);

  switch (frequency) {
    case "daily":
      nextScan.setDate(nextScan.getDate() + 1);
      break;
    case "weekly":
      nextScan.setDate(nextScan.getDate() + 7);
      break;
    case "monthly":
      nextScan.setMonth(nextScan.getMonth() + 1);
      break;
  }

  return nextScan;
}

/**
 * Start monitoring scheduler (runs every 5 minutes)
 */
export function startMonitoringScheduler() {
  console.log("Starting monitoring scheduler...");

  // Run every 5 minutes
  setInterval(async () => {
    try {
      const assetsToScan = await getAssetsToScan();
      
      if (assetsToScan.length > 0) {
        console.log(`[Monitoring] Found ${assetsToScan.length} assets to scan`);
        
        for (const asset of assetsToScan) {
          await executeScanForAsset(asset.id);
        }
      }
    } catch (error) {
      console.error("[Monitoring] Scheduler error:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Get unread alerts for a user
 */
export async function getUnreadAlerts(userId: number) {
  if (!db) db = await getDb();
  return await db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.userId, userId),
        eq(alerts.isRead, 0)
      )
    )
    .orderBy((t: any) => t.createdAt);
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: number) {
  if (!db) db = await getDb();
  return await db
    .update(alerts)
    .set({ isRead: 1 })
    .where(eq(alerts.id, alertId));
}

/**
 * Mark alert as resolved
 */
export async function markAlertAsResolved(alertId: number) {
  if (!db) db = await getDb();
  return await db
    .update(alerts)
    .set({ 
      isResolved: 1,
      resolvedAt: new Date(),
    })
    .where(eq(alerts.id, alertId));
}
