CREATE TABLE `canaryTokenTriggers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`referer` text,
	`country` varchar(100),
	`city` varchar(100),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`deviceType` varchar(50),
	`browser` varchar(100),
	`browserVersion` varchar(50),
	`os` varchar(100),
	`osVersion` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `canaryTokenTriggers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `canaryTokens` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`email` varchar(320) NOT NULL,
	`tokenType` enum('page_view','resource','form_submission','api_call') NOT NULL DEFAULT 'page_view',
	`status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
	`tokenUrl` text NOT NULL,
	`expiresAt` timestamp,
	`triggerLimit` int,
	`triggerCount` int DEFAULT 0,
	`lastTriggeredAt` timestamp,
	`notificationEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canaryTokens_id` PRIMARY KEY(`id`)
);
