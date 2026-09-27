ALTER TABLE "drawing_board_invite" RENAME TO "drawing_board_member";--> statement-breakpoint
ALTER TABLE "drawing_board_member" RENAME COLUMN "invitee_id" TO "member_id";--> statement-breakpoint
ALTER INDEX "drawing_board_invite_unique" RENAME TO "drawing_board_member_unique";