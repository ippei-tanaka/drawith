CREATE TABLE "drawing_board_invite" (
	"id" text PRIMARY KEY,
	"drawing_board_id" text NOT NULL,
	"invitee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "drawing_board_invite_unique" ON "drawing_board_invite" ("drawing_board_id","invitee_id");--> statement-breakpoint
ALTER TABLE "drawing_board_invite" ADD CONSTRAINT "drawing_board_invite_drawing_board_id_drawing_board_id_fkey" FOREIGN KEY ("drawing_board_id") REFERENCES "drawing_board"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "drawing_board_invite" ADD CONSTRAINT "drawing_board_invite_invitee_id_user_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "user"("id") ON DELETE CASCADE;