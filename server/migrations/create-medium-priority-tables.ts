import { getDb } from "../db";
import { sql } from "drizzle-orm";

export async function ensureMediumPriorityTables() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("[Migration] Database not available, skipping medium priority tables creation");
      return;
    }

    console.log("[Migration] Ensuring medium priority feature tables...");

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`cloudStorageFiles\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`fileName\` varchar(255) NOT NULL,
        \`fileSize\` bigint NOT NULL,
        \`mimeType\` varchar(100) NOT NULL,
        \`s3Key\` varchar(255) NOT NULL,
        \`s3Url\` text NOT NULL,
        \`isShared\` boolean NOT NULL DEFAULT false,
        \`shareToken\` varchar(64),
        \`parentFolderId\` int,
        \`isFolder\` boolean NOT NULL DEFAULT false,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`cloudStorageFiles_s3Key_unique\` (\`s3Key\`),
        KEY \`cloudStorageFiles_userId_idx\` (\`userId\`),
        KEY \`cloudStorageFiles_parentFolderId_idx\` (\`parentFolderId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`cloudStorageBackups\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`backupName\` varchar(255) NOT NULL,
        \`backupSize\` bigint NOT NULL,
        \`s3Key\` varchar(255) NOT NULL,
        \`fileCount\` int NOT NULL DEFAULT 0,
        \`status\` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`completedAt\` timestamp NULL,
        KEY \`cloudStorageBackups_userId_idx\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`cloudStorageSyncHistory\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`syncType\` enum('upload','download','delete','update') NOT NULL,
        \`fileId\` int,
        \`fileName\` varchar(255),
        \`status\` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
        \`errorMessage\` text,
        \`syncedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`cloudStorageSyncHistory_userId_idx\` (\`userId\`),
        KEY \`cloudStorageSyncHistory_fileId_idx\` (\`fileId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`sockPuppets\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`userId\` int NOT NULL,
        \`puppetId\` varchar(64) NOT NULL,
        \`alias\` varchar(100) NOT NULL,
        \`fullName\` varchar(255),
        \`bio\` text,
        \`email\` varchar(320),
        \`platform\` varchar(50) NOT NULL,
        \`avatarUrl\` text,
        \`persona\` text,
        \`status\` enum('active','suspended','retired') NOT NULL DEFAULT 'active',
        \`postCount\` int NOT NULL DEFAULT 0,
        \`followersCount\` int NOT NULL DEFAULT 0,
        \`followingCount\` int NOT NULL DEFAULT 0,
        \`notes\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`lastActiveAt\` timestamp NULL,
        UNIQUE KEY \`sockPuppets_puppetId_unique\` (\`puppetId\`),
        KEY \`sockPuppets_userId_idx\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS \`sockPuppetActivity\` (
        \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        \`puppetId\` varchar(64) NOT NULL,
        \`userId\` int NOT NULL,
        \`activityType\` enum('post','comment','follow','like','dm','retweet','share') NOT NULL,
        \`content\` text,
        \`targetUrl\` text,
        \`platform\` varchar(50) NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY \`sockPuppetActivity_puppetId_idx\` (\`puppetId\`),
        KEY \`sockPuppetActivity_userId_idx\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `));

    console.log("[Migration] Medium priority feature tables ready");
  } catch (error) {
    console.error("[Migration] Error creating medium priority feature tables:", error);
  }
}
