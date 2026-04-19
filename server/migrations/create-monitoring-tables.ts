import { getDb } from "../db";
import { sql } from "drizzle-orm";

/**
 * Auto-migration: Creates monitoring tables if they don't exist
 * This runs on server startup to ensure production DB has all required tables
 */
export async function ensureMonitoringTables() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[Migration] Database not available, skipping monitoring tables creation");
      return;
    }

    // Check if monitoredAssets table exists
    const result = await db.execute(
      sql.raw(`SELECT COUNT(*) as count FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'monitoredAssets'`)
    );

    const tableExists = (result[0] as any)?.count > 0;

    if (!tableExists) {
      console.log("[Migration] Creating monitoring tables...");

      // Create monitoredAssets table
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`monitoredAssets\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`userId\` int NOT NULL,
          \`assetType\` enum('domain','ip','service','email') NOT NULL,
          \`assetValue\` varchar(255) NOT NULL,
          \`description\` text,
          \`scanFrequency\` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
          \`isActive\` int DEFAULT 1,
          \`lastScanned\` timestamp NULL,
          \`nextScan\` timestamp NULL,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY \`userId\` (\`userId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));

      // Create alertRules table
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`alertRules\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`userId\` int NOT NULL,
          \`monitoredAssetId\` int NOT NULL,
          \`ruleType\` enum('new_port','ssl_expiry','dns_change','subdomain_found','ip_reputation','service_version') NOT NULL,
          \`severity\` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
          \`isEnabled\` int DEFAULT 1,
          \`notifyEmail\` int DEFAULT 1,
          \`notifyDashboard\` int DEFAULT 1,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY \`userId\` (\`userId\`),
          KEY \`monitoredAssetId\` (\`monitoredAssetId\`),
          FOREIGN KEY (\`monitoredAssetId\`) REFERENCES \`monitoredAssets\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));

      // Create alerts table
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`alerts\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`userId\` int NOT NULL,
          \`monitoredAssetId\` int NOT NULL,
          \`alertType\` enum('new_port','ssl_expiry','dns_change','subdomain_found','ip_reputation','service_version') NOT NULL,
          \`severity\` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
          \`title\` varchar(255) NOT NULL,
          \`description\` text,
          \`details\` text,
          \`isRead\` int DEFAULT 0,
          \`isResolved\` int DEFAULT 0,
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`resolvedAt\` timestamp NULL,
          KEY \`userId\` (\`userId\`),
          KEY \`monitoredAssetId\` (\`monitoredAssetId\`),
          FOREIGN KEY (\`monitoredAssetId\`) REFERENCES \`monitoredAssets\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));

      // Create monitoringScanHistory table
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS \`monitoringScanHistory\` (
          \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`monitoredAssetId\` int NOT NULL,
          \`scanType\` varchar(50) NOT NULL,
          \`previousResults\` text,
          \`currentResults\` text,
          \`changeDetected\` int DEFAULT 0,
          \`changeDetails\` text,
          \`status\` enum('pending','running','completed','error') NOT NULL DEFAULT 'pending',
          \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          KEY \`monitoredAssetId\` (\`monitoredAssetId\`),
          FOREIGN KEY (\`monitoredAssetId\`) REFERENCES \`monitoredAssets\`(\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `));

      console.log("[Migration] ✓ Monitoring tables created successfully");
    } else {
      console.log("[Migration] ✓ Monitoring tables already exist");
    }
  } catch (error) {
    console.error("[Migration] Error creating monitoring tables:", error);
    // Don't throw - allow server to continue even if migration fails
  }
}

// Auto-run migration on module load if DB is available
if (process.env.DATABASE_URL) {
  ensureMonitoringTables().catch(err => {
    console.error("[Migration] Failed to run auto-migration:", err);
  });
}
