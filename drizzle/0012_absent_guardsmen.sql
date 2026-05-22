CREATE TABLE `cmsComponents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`componentType` varchar(50) NOT NULL,
	`description` text,
	`componentData` text NOT NULL,
	`cssClass` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsComponents_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsComponents_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `cmsEditHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`editedBy` int NOT NULL,
	`changeType` varchar(50) NOT NULL,
	`previousContent` text,
	`newContent` text,
	`changeDescription` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cmsEditHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cmsMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`s3Url` varchar(500) NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`uploadedBy` int NOT NULL,
	`altText` varchar(500),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsMedia_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cmsNavigationMenus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`menuItems` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsNavigationMenus_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsNavigationMenus_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `cmsPageSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`sectionType` varchar(50) NOT NULL,
	`title` varchar(255),
	`subtitle` varchar(500),
	`content` text,
	`sectionData` text,
	`displayOrder` int DEFAULT 0,
	`backgroundColor` varchar(7),
	`textColor` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsPageSections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cmsPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`heroSection` text,
	`seoKeywords` varchar(500),
	`published` int DEFAULT 1,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `cmsPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsPages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cmsSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` varchar(500),
	`settingType` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cmsSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `cmsSettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `sockPuppetActivity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`puppetId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('post','comment','follow','like','dm','retweet','share') NOT NULL,
	`content` text,
	`targetUrl` text,
	`platform` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sockPuppetActivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sockPuppets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`puppetId` varchar(64) NOT NULL,
	`alias` varchar(100) NOT NULL,
	`fullName` varchar(255),
	`bio` text,
	`email` varchar(320),
	`platform` varchar(50) NOT NULL,
	`avatarUrl` text,
	`persona` text,
	`status` enum('active','suspended','retired') NOT NULL DEFAULT 'active',
	`postCount` int NOT NULL DEFAULT 0,
	`followersCount` int NOT NULL DEFAULT 0,
	`followingCount` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastActiveAt` timestamp,
	CONSTRAINT `sockPuppets_id` PRIMARY KEY(`id`),
	CONSTRAINT `sockPuppets_puppetId_unique` UNIQUE(`puppetId`)
);
--> statement-breakpoint
ALTER TABLE `mdmDevices` ADD `enrollmentToken` varchar(128);--> statement-breakpoint
ALTER TABLE `mdmDevices` ADD `enrollmentUrl` text;--> statement-breakpoint
ALTER TABLE `mdmDevices` ADD `enrollmentTokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `mdmPolicies` ADD `requireBiometric` int DEFAULT 0;