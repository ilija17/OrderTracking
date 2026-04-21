CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_cents` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`item` text,
	`vendor_id` integer,
	`quantity` integer,
	`unit_price_cents` integer,
	`order_number` text,
	`tracking_number` text,
	`attachment_path` text,
	`order_date` text NOT NULL,
	`expected_date` text,
	`received_date` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "title", "item", "vendor_id", "quantity", "unit_price_cents", "order_number", "tracking_number", "attachment_path", "order_date", "expected_date", "received_date", "status", "notes", "created_by", "created_at", "updated_at") SELECT "id", "item", "item", "vendor_id", "quantity", "unit_price_cents", "order_number", "tracking_number", "attachment_path", "order_date", "expected_date", "received_date", "status", "notes", "created_by", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
INSERT INTO `order_items`("order_id", "name", "quantity", "unit_price_cents") SELECT "id", "item", "quantity", "unit_price_cents" FROM `orders` WHERE "item" IS NOT NULL;--> statement-breakpoint
ALTER TABLE `vendors` ADD `image_path` text;