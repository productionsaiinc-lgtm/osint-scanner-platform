CREATE TABLE `mdmAppUsageAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`appPackageName` varchar(255) NOT NULL,
	`appName` varchar(255) NOT NULL,
	`category` varchar(100),
	`usageTime` int,
	`launchCount` int DEFAULT 0,
	`dataUsed` int,
	`batteryDrain` decimal(5,2),
	`lastUsed` timestamp,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmAppUsageAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmDeviceLocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`accuracy` int,
	`altitude` decimal(10,2),
	`speed` decimal(8,2),
	`heading` decimal(6,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmDeviceLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmDevicePerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`cpuUsage` decimal(5,2),
	`memoryUsage` decimal(5,2),
	`storageUsage` decimal(5,2),
	`batteryLevel` int,
	`batteryHealth` varchar(50),
	`temperature` decimal(5,2),
	`uptime` int,
	`restarts` int DEFAULT 0,
	`crashes` int DEFAULT 0,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmDevicePerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmNetworkMonitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`networkType` varchar(50) NOT NULL,
	`ssid` varchar(255),
	`signalStrength` int,
	`bandwidth` varchar(50),
	`ipAddress` varchar(45),
	`macAddress` varchar(17),
	`dataUsage` int,
	`uploadSpeed` decimal(10,2),
	`downloadSpeed` decimal(10,2),
	`latency` int,
	`packetLoss` decimal(5,2),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmNetworkMonitoring_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmSecurityEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text,
	`threatName` varchar(255),
	`source` varchar(255),
	`resolved` boolean DEFAULT false,
	`resolutionAction` varchar(255),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmSecurityEvents_id` PRIMARY KEY(`id`)
);
