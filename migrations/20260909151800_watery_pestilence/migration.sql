ALTER TABLE "drawing_board" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing_board" ADD CONSTRAINT "drawing_board_name_key" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_name_key" UNIQUE("name");