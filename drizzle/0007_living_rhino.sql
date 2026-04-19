CREATE TABLE `mdmDeviceCommands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`commandType` enum('lock','wipe','restart','update_policy','install_app','uninstall_app','take_screenshot','get_location') NOT NULL,
	`commandStatus` enum('pending','sent','executed','failed') NOT NULL DEFAULT 'pending',
	`commandData` text,
	`executedAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mdmDeviceCommands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmDeviceLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`logType` enum('enrollment','policy_applied','command_executed','compliance_check','security_event','app_installed','app_uninstalled') NOT NULL,
	`logMessage` text NOT NULL,
	`logData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mdmDeviceLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmDevicePolicyAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`policyId` int NOT NULL,
	`assignmentStatus` enum('pending','applied','failed','revoked') NOT NULL DEFAULT 'pending',
	`appliedAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mdmDevicePolicyAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mdmDevices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(100) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceType` enum('android','ios','windows','macos','linux') NOT NULL,
	`osVersion` varchar(50),
	`manufacturer` varchar(100),
	`model` varchar(100),
	`imei` varchar(20),
	`serialNumber` varchar(100),
	`enrollmentStatus` enum('pending','enrolled','unenrolled','suspended') NOT NULL DEFAULT 'pending',
	`enrollmentDate` timestamp,
	`lastCheckIn` timestamp,
	`ipAddress` varchar(45),
	`location` text,
	`batteryLevel` int,
	`storageUsed` int,
	`storageTotal` int,
	`isCompliant` int DEFAULT 1,
	`complianceIssues` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mdmDevices_id` PRIMARY KEY(`id`),
	CONSTRAINT `mdmDevices_deviceId_unique` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `mdmPolicies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`policyName` varchar(255) NOT NULL,
	`description` text,
	`policyType` enum('security','compliance','app_management','network','device_control') NOT NULL,
	`minPasswordLength` int DEFAULT 6,
	`requireNumeric` int DEFAULT 0,
	`requireSpecialChar` int DEFAULT 0,
	`maxPasswordAge` int,
	`passwordExpirationWarning` int,
	`allowUsbDebug` int DEFAULT 0,
	`allowUnknownSources` int DEFAULT 0,
	`allowDeveloperMode` int DEFAULT 0,
	`enableEncryption` int DEFAULT 1,
	`allowedApps` text,
	`blockedApps` text,
	`requireVpn` int DEFAULT 0,
	`allowedWifi` text,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mdmPolicies_id` PRIMARY KEY(`id`)
);
