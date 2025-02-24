ALTER TABLE `admins` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `admins` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `admins` MODIFY COLUMN `password_hash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` MODIFY COLUMN `email` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` MODIFY COLUMN `password_hash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `bus_trips` MODIFY COLUMN `departure_city` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `bus_trips` MODIFY COLUMN `destination_city` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` MODIFY COLUMN `passenger_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` MODIFY COLUMN `passenger_phone` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` MODIFY COLUMN `payment_method` varchar(50) DEFAULT 'Cash';