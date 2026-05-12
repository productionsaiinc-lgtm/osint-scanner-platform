import { getDb } from "../db";
import { sql } from "drizzle-orm";

export async function ensureMdmTables() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[Migration] Database not available, skipping MDM tables creation");
      return;
    }

    console.log("[Migration] Ensuring MDM tables...");

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDevices\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`deviceId\` varchar(100) NOT NULL,
        \`deviceName\` varchar(255) NOT NULL,
        \`deviceType\` enum('android','ios','windows','macos','linux') NOT NULL,
        \`osVersion\` varchar(50),
        \`manufacturer\` varchar(100),
        \`model\` varchar(100),
        \`imei\` varchar(20),
        \`serialNumber\` varchar(100),
        \`enrollmentToken\` varchar(128),
        \`enrollmentUrl\` text,
        \`enrollmentTokenExpiresAt\` timestamp NULL,
        \`enrollmentStatus\` enum('pending','enrolled','unenrolled','suspended') NOT NULL DEFAULT 'pending',
        \`enrollmentDate\` timestamp NULL,
        \`lastCheckIn\` timestamp NULL,
        \`ipAddress\` varchar(45),
        \`location\` text,
        \`batteryLevel\` int,
        \`storageUsed\` int,
        \`storageTotal\` int,
        \`isCompliant\` int DEFAULT 1,
        \`complianceIssues\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`mdmDevices_deviceId_unique\` (\`deviceId\`),
        KEY \`mdmDevices_userId_idx\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmPolicies\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`policyName\` varchar(255) NOT NULL,
        \`description\` text,
        \`policyType\` enum('security','compliance','app_management','network','device_control') NOT NULL,
        \`minPasswordLength\` int DEFAULT 6,
        \`requireNumeric\` int DEFAULT 0,
        \`requireSpecialChar\` int DEFAULT 0,
        \`requireBiometric\` int DEFAULT 0,
        \`maxPasswordAge\` int,
        \`passwordExpirationWarning\` int,
        \`allowUsbDebug\` int DEFAULT 0,
        \`allowUnknownSources\` int DEFAULT 0,
        \`allowDeveloperMode\` int DEFAULT 0,
        \`enableEncryption\` int DEFAULT 1,
        \`allowedApps\` text,
        \`blockedApps\` text,
        \`requireVpn\` int DEFAULT 0,
        \`allowedWifi\` text,
        \`isActive\` int DEFAULT 1,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`mdmPolicies_userId_idx\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDevicePolicyAssignments\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`policyId\` int NOT NULL,
        \`assignmentStatus\` enum('pending','applied','failed','revoked') NOT NULL DEFAULT 'pending',
        \`appliedAt\` timestamp NULL,
        \`failureReason\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`mdmPolicyAssignments_deviceId_idx\` (\`deviceId\`),
        KEY \`mdmPolicyAssignments_policyId_idx\` (\`policyId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDeviceCommands\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`commandType\` enum('lock','wipe','restart','update_policy','install_app','uninstall_app','take_screenshot','get_location') NOT NULL,
        \`commandStatus\` enum('pending','sent','executed','failed') NOT NULL DEFAULT 'pending',
        \`commandData\` text,
        \`executedAt\` timestamp NULL,
        \`failureReason\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`mdmDeviceCommands_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDeviceLogs\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`logType\` enum('enrollment','policy_applied','command_executed','compliance_check','security_event','app_installed','app_uninstalled') NOT NULL,
        \`logMessage\` text NOT NULL,
        \`logData\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmDeviceLogs_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDeviceLocations\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`latitude\` decimal(10,8) NOT NULL,
        \`longitude\` decimal(11,8) NOT NULL,
        \`accuracy\` int,
        \`altitude\` decimal(10,2),
        \`speed\` decimal(8,2),
        \`heading\` decimal(6,2),
        \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmDeviceLocations_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmNetworkMonitoring\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`networkType\` varchar(50) NOT NULL,
        \`ssid\` varchar(255),
        \`signalStrength\` int,
        \`bandwidth\` varchar(50),
        \`ipAddress\` varchar(45),
        \`macAddress\` varchar(17),
        \`dataUsage\` int,
        \`uploadSpeed\` decimal(10,2),
        \`downloadSpeed\` decimal(10,2),
        \`latency\` int,
        \`packetLoss\` decimal(5,2),
        \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmNetworkMonitoring_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmAppUsageAnalytics\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`appPackageName\` varchar(255) NOT NULL,
        \`appName\` varchar(255) NOT NULL,
        \`category\` varchar(100),
        \`usageTime\` int,
        \`launchCount\` int DEFAULT 0,
        \`dataUsed\` int,
        \`batteryDrain\` decimal(5,2),
        \`lastUsed\` timestamp NULL,
        \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmAppUsageAnalytics_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmDevicePerformance\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`cpuUsage\` decimal(5,2),
        \`memoryUsage\` decimal(5,2),
        \`storageUsage\` decimal(5,2),
        \`batteryLevel\` int,
        \`batteryHealth\` varchar(50),
        \`temperature\` decimal(5,2),
        \`uptime\` int,
        \`restarts\` int DEFAULT 0,
        \`crashes\` int DEFAULT 0,
        \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmDevicePerformance_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`mdmSecurityEvents\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`deviceId\` int NOT NULL,
        \`eventType\` varchar(100) NOT NULL,
        \`severity\` enum('low','medium','high','critical') NOT NULL,
        \`description\` text,
        \`threatName\` varchar(255),
        \`source\` varchar(255),
        \`resolved\` boolean DEFAULT false,
        \`resolutionAction\` varchar(255),
        \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`mdmSecurityEvents_deviceId_idx\` (\`deviceId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    try {
      await db.execute(sql.raw("ALTER TABLE `mdmPolicies` ADD COLUMN `requireBiometric` int DEFAULT 0"));
    } catch (error: any) {
      if (!String(error?.message || "").includes("Duplicate column")) {
        console.warn("[Migration] Could not add mdmPolicies.requireBiometric:", error?.message || error);
      }
    }

    for (const statement of [
      "ALTER TABLE `mdmDevices` ADD COLUMN `enrollmentToken` varchar(128)",
      "ALTER TABLE `mdmDevices` ADD COLUMN `enrollmentUrl` text",
      "ALTER TABLE `mdmDevices` ADD COLUMN `enrollmentTokenExpiresAt` timestamp NULL",
    ]) {
      try {
        await db.execute(sql.raw(statement));
      } catch (error: any) {
        if (!String(error?.message || "").includes("Duplicate column")) {
          console.warn("[Migration] Could not update mdmDevices enrollment columns:", error?.message || error);
        }
      }
    }

    console.log("[Migration] MDM tables ready");
  } catch (error) {
    console.error("[Migration] Error creating MDM tables:", error);
  }
}
