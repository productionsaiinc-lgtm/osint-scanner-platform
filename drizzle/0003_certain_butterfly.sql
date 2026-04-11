CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` int DEFAULT 1,
	`pushNotifications` int DEFAULT 1,
	`inAppNotifications` int DEFAULT 1,
	`scanCompleteNotifications` int DEFAULT 1,
	`paymentNotifications` int DEFAULT 1,
	`subscriptionNotifications` int DEFAULT 1,
	`securityAlertNotifications` int DEFAULT 1,
	`emailFrequency` enum('immediate','daily','weekly','never') NOT NULL DEFAULT 'daily',
	`notificationSound` int DEFAULT 1,
	`notificationVibration` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('scan_complete','scan_error','payment_success','payment_failed','subscription_update','subscription_expiring','vulnerability_found','payout_received','payout_failed','security_alert','system_update','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`status` enum('unread','read','archived') NOT NULL DEFAULT 'unread',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`actionUrl` varchar(500),
	`emailSent` int DEFAULT 0,
	`pushSent` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pushSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(500) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`userAgent` varchar(500),
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushSubscriptions_id` PRIMARY KEY(`id`)
);
