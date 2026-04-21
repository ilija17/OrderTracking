ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
UPDATE `users` SET `role` = 'admin' WHERE `username` = 'admin';