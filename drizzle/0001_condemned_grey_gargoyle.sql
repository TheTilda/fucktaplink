CREATE TABLE `landings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`image_url` varchar(1024),
	`rating` decimal(3,1) DEFAULT '0.0',
	`reviews` int DEFAULT 0,
	`purchases` int DEFAULT 0,
	`link_wb` text,
	`link_ozon` text,
	`link_ym` text,
	`status` varchar(20) DEFAULT 'active',
	`views` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `landings_id` PRIMARY KEY(`id`),
	CONSTRAINT `landings_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `landings_user_idx` ON `landings` (`user_id`);