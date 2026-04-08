CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`paypalTransactionId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('completed','pending','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50) NOT NULL DEFAULT 'paypal',
	`invoiceNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`billingCycle` enum('monthly','yearly') NOT NULL,
	`maxScansPerMonth` int DEFAULT 0,
	`maxApiCalls` int DEFAULT 0,
	`features` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`paypalSubscriptionId` varchar(255),
	`status` enum('active','cancelled','expired','pending') NOT NULL DEFAULT 'pending',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`autoRenew` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
