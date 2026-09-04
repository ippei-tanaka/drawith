CREATE TABLE "drawing_board" (
	"id" uuid PRIMARY KEY,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" RENAME TO "user_profile";--> statement-breakpoint
ALTER TABLE "user_profile" ALTER COLUMN "first_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ALTER COLUMN "last_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "drawing_board" ADD CONSTRAINT "drawing_board_owner_id_user_profile_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user_profile"("user_id");