CREATE TABLE `cloudStorageBackups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`backupName` varchar(255) NOT NULL,
	`backupSize` bigint NOT NULL,
	`s3Key` varchar(255) NOT NULL,
	`fileCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `cloudStorageBackups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cloudStorageFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` bigint NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`s3Key` varchar(255) NOT NULL,
	`s3Url` text NOT NULL,
	`isShared` boolean NOT NULL DEFAULT false,
	`shareToken` varchar(64),
	`parentFolderId` int,
	`isFolder` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cloudStorageFiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `cloudStorageFiles_s3Key_unique` UNIQUE(`s3Key`)
);
--> statement-breakpoint
CREATE TABLE `cloudStorageSyncHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncType` enum('upload','download','delete','update') NOT NULL,
	`fileId` int,
	`fileName` varchar(255),
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cloudStorageSyncHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fileAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileHash` varchar(128) NOT NULL,
	`fileSize` bigint NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`s3Key` varchar(255),
	`virusTotalScanId` varchar(255),
	`threatLevel` enum('clean','suspicious','malicious','unknown') NOT NULL DEFAULT 'unknown',
	`detectionCount` int NOT NULL DEFAULT 0,
	`totalEngines` int NOT NULL DEFAULT 0,
	`analysisResults` text,
	`status` enum('pending','scanning','completed','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fileAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shortenedUrls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shortCode` varchar(20) NOT NULL,
	`originalUrl` text NOT NULL,
	`customAlias` varchar(100),
	`title` varchar(255),
	`description` text,
	`clickCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shortenedUrls_id` PRIMARY KEY(`id`),
	CONSTRAINT `shortenedUrls_shortCode_unique` UNIQUE(`shortCode`)
);
--> statement-breakpoint
CREATE TABLE `tempEmailAddresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailAddress` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tempEmailAddresses_id` PRIMARY KEY(`id`),
	CONSTRAINT `tempEmailAddresses_emailAddress_unique` UNIQUE(`emailAddress`)
);
--> statement-breakpoint
CREATE TABLE `tempEmailMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tempEmailId` int NOT NULL,
	`fromAddress` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`htmlBody` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tempEmailMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `urlClickAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shortenedUrlId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`referer` text,
	`country` varchar(100),
	`city` varchar(100),
	`deviceType` varchar(50),
	`browser` varchar(100),
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `urlClickAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `virtualComputers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vmId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`osType` varchar(50) NOT NULL,
	`osVersion` varchar(100),
	`ram` int NOT NULL,
	`storage` int NOT NULL,
	`cpu` int NOT NULL,
	`status` enum('stopped','running','paused','error') NOT NULL DEFAULT 'stopped',
	`ipAddress` varchar(45),
	`rdpPort` int,
	`sshPort` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastAccessedAt` timestamp,
	CONSTRAINT `virtualComputers_id` PRIMARY KEY(`id`),
	CONSTRAINT `virtualComputers_vmId_unique` UNIQUE(`vmId`)
);
--> statement-breakpoint
CREATE TABLE `virtualPhones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`osType` varchar(50) NOT NULL,
	`osVersion` varchar(100),
	`phoneNumber` varchar(20),
	`imei` varchar(20),
	`status` enum('offline','online','busy','error') NOT NULL DEFAULT 'offline',
	`ipAddress` varchar(45),
	`adbPort` int,
	`location` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastAccessedAt` timestamp,
	CONSTRAINT `virtualPhones_id` PRIMARY KEY(`id`),
	CONSTRAINT `virtualPhones_deviceId_unique` UNIQUE(`deviceId`)
);
