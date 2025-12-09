CREATE TABLE `images` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`key` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`mime` varchar(128) NOT NULL,
	`size` int NOT NULL,
	`width` int,
	`height` int,
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`image_url` varchar(1024),
	`status` varchar(20) DEFAULT 'active',
	`clicks` int NOT NULL DEFAULT 0,
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(128) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `images_user_idx` ON `images` (`user_id`);--> statement-breakpoint
CREATE INDEX `links_user_idx` ON `links` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);