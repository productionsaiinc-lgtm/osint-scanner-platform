CREATE TABLE `discoveredHosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`hostname` varchar(255),
	`openPorts` text,
	`services` text,
	`geolocation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `discoveredHosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `domainRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`registrar` varchar(255),
	`registrationDate` varchar(50),
	`expirationDate` varchar(50),
	`nameservers` text,
	`dnsRecords` text,
	`sslCertificate` text,
	`subdomains` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `domainRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scanType` varchar(50) NOT NULL,
	`target` varchar(255) NOT NULL,
	`status` enum('pending','running','completed','error') NOT NULL DEFAULT 'pending',
	`rawResults` text,
	`threatAnalysis` text,
	`vulnerabilityCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialMediaProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`username` varchar(255) NOT NULL,
	`platform` varchar(50) NOT NULL,
	`profileUrl` varchar(500),
	`displayName` varchar(255),
	`bio` text,
	`followers` int,
	`following` int,
	`profileData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialMediaProfiles_id` PRIMARY KEY(`id`)
);
