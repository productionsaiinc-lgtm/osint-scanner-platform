CREATE TABLE `alertRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monitoredAssetId` int NOT NULL,
	`ruleType` enum('new_port','ssl_expiry','dns_change','subdomain_found','ip_reputation','service_version') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`isEnabled` int DEFAULT 1,
	`notifyEmail` int DEFAULT 1,
	`notifyDashboard` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monitoredAssetId` int NOT NULL,
	`alertType` enum('new_port','ssl_expiry','dns_change','subdomain_found','ip_reputation','service_version') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`description` text,
	`details` text,
	`isRead` int DEFAULT 0,
	`isResolved` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoredAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`assetType` enum('domain','ip','service','email') NOT NULL,
	`assetValue` varchar(255) NOT NULL,
	`description` text,
	`scanFrequency` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
	`isActive` int DEFAULT 1,
	`lastScanned` timestamp,
	`nextScan` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoredAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoringScanHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`monitoredAssetId` int NOT NULL,
	`scanType` varchar(50) NOT NULL,
	`previousResults` text,
	`currentResults` text,
	`changeDetected` int DEFAULT 0,
	`changeDetails` text,
	`status` enum('pending','running','completed','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoringScanHistory_id` PRIMARY KEY(`id`)
);
