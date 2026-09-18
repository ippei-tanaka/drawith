ALTER TABLE "drawing_board_member" RENAME TO "drawing_board_membership";--> statement-breakpoint
DROP INDEX "drawing_board_invite_unique";--> statement-breakpoint
DROP INDEX "drawing_board_member_unique";--> statement-breakpoint
DROP INDEX "user_profile_user_id_unique";--> statement-breakpoint
ALTER TABLE "drawing_board_invitation" ADD CONSTRAINT "drawing_board_invite_unique" UNIQUE("drawing_board_id","invitee_id");--> statement-breakpoint
ALTER TABLE "drawing_board_membership" ADD CONSTRAINT "drawing_board_member_unique" UNIQUE("drawing_board_id","member_id");--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_key" UNIQUE("user_id");