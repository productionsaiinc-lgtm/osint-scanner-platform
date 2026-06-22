CREATE TABLE `billingAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalRevenue` int DEFAULT 0,
	`subscriptionCount` int DEFAULT 0,
	`activeSubscriptions` int DEFAULT 0,
	`cancelledSubscriptions` int DEFAULT 0,
	`churnRate` int DEFAULT 0,
	`averageOrderValue` int DEFAULT 0,
	`failedPayments` int DEFAULT 0,
	`refunds` int DEFAULT 0,
	`discountsGiven` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billingAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodeUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promoCodeId` int NOT NULL,
	`userId` int NOT NULL,
	`paymentId` int NOT NULL,
	`discountAmount` int NOT NULL,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promoCodeUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`maxUses` int,
	`currentUses` int DEFAULT 0,
	`maxUsesPerUser` int DEFAULT 1,
	`applicablePlans` text,
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp NOT NULL,
	`isActive` int DEFAULT 1,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
