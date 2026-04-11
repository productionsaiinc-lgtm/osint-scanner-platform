CREATE TABLE `breachDatabaseEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`breachSource` varchar(100) NOT NULL,
	`breachDate` timestamp,
	`breachType` varchar(100),
	`dataExposed` text,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`verified` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breachDatabaseEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carrierSimSwapStatus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`carrier` varchar(100) NOT NULL,
	`protectionEnabled` int DEFAULT 0,
	`protectionType` varchar(100),
	`lastVerified` timestamp,
	`verificationMethod` varchar(100),
	`accountStatus` enum('active','suspended','flagged','unknown') NOT NULL DEFAULT 'unknown',
	`suspiciousActivityCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carrierSimSwapStatus_id` PRIMARY KEY(`id`),
	CONSTRAINT `carrierSimSwapStatus_phoneNumber_unique` UNIQUE(`phoneNumber`)
);
--> statement-breakpoint
CREATE TABLE `simSwapPatterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`multipleCarrierChanges` int DEFAULT 0,
	`frequentPorting` int DEFAULT 0,
	`suspiciousLoginAttempts` int DEFAULT 0,
	`accountRecoveryAttempts` int DEFAULT 0,
	`passwordResetAttempts` int DEFAULT 0,
	`smsVerificationFails` int DEFAULT 0,
	`unusualGeoLocation` int DEFAULT 0,
	`deviceChanges` int DEFAULT 0,
	`riskScore` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simSwapPatterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simSwapRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`carrier` varchar(100),
	`isSwapped` int DEFAULT 0,
	`riskScore` int DEFAULT 0,
	`riskLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`detectionMethod` varchar(100),
	`breachIndicators` text,
	`carrierIndicators` text,
	`patternIndicators` text,
	`simSwapProtectionEnabled` int DEFAULT 0,
	`protectionType` varchar(100),
	`lastActivityChange` timestamp,
	`suspiciousActivities` text,
	`confidence` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simSwapRecords_id` PRIMARY KEY(`id`)
);
