CREATE TABLE "drawing_board_state" (
	"board_id" text PRIMARY KEY,
	"revision" integer DEFAULT 0 NOT NULL,
	"content_version" integer DEFAULT 1 NOT NULL,
	"state" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drawing_board_state" ADD CONSTRAINT "drawing_board_state_board_id_drawing_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "drawing_board"("id") ON DELETE CASCADE;