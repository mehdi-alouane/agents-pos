CREATE TABLE `admins` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` timestamp DEFAULT NOW(),
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` timestamp DEFAULT NOW(),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `bus_trips` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`departure_city` text NOT NULL,
	`destination_city` text NOT NULL,
	`departure_date` timestamp NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`created_by` bigint NOT NULL,
	`created_at` timestamp DEFAULT NOW(),
	CONSTRAINT `bus_trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_records` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`ticket_id` bigint NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`sold_by` bigint NOT NULL,
	`sold_at` timestamp DEFAULT NOW(),
	CONSTRAINT `sales_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_id_idx` UNIQUE(`ticket_id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`bus_trip_id` bigint NOT NULL,
	`seat_number` int NOT NULL,
	`passenger_name` text NOT NULL,
	`passenger_phone` text NOT NULL,
	`is_paid` boolean DEFAULT false,
	`payment_method` text DEFAULT ('Cash'),
	`sold_by` bigint NOT NULL,
	`sold_at` timestamp DEFAULT NOW(),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bus_trips` ADD CONSTRAINT `bus_trips_created_by_admins_id_fk` FOREIGN KEY (`created_by`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_records` ADD CONSTRAINT `sales_records_ticket_id_tickets_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sales_records` ADD CONSTRAINT `sales_records_sold_by_agents_id_fk` FOREIGN KEY (`sold_by`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_bus_trip_id_bus_trips_id_fk` FOREIGN KEY (`bus_trip_id`) REFERENCES `bus_trips`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_sold_by_agents_id_fk` FOREIGN KEY (`sold_by`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;