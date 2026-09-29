"use server";

import { and, eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db/db";
import { drawingBoard, drawingBoardMembership, drawingBoardState } from "@/lib/db/schema";
import type { PersistedBoardState } from "@/lib/store/boardSlice";

type BoardStateResult = {
  state: PersistedBoardState | null;
  revision: number;
};

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

async function canAccessBoard(boardId: string, userId: string) {
  const [board] = await db
    .select({ id: drawingBoard.id })
    .from(drawingBoard)
    .leftJoin(
      drawingBoardMembership,
      eq(drawingBoardMembership.drawing_board_id, drawingBoard.id),
    )
    .where(
      and(
        eq(drawingBoard.id, boardId),
        or(
          eq(drawingBoard.owner_id, userId),
          eq(drawingBoardMembership.member_id, userId),
        ),
      ),
    )
    .limit(1);

  return Boolean(board);
}

export async function loadBoardState(boardId: string): Promise<BoardStateResult> {
  const userId = await getAuthenticatedUserId();
  if (!userId || !(await canAccessBoard(boardId, userId))) {
    throw new Error("Board not found or access denied");
  }

  const [snapshot] = await db
    .select({ state: drawingBoardState.state, revision: drawingBoardState.revision })
    .from(drawingBoardState)
    .where(eq(drawingBoardState.board_id, boardId))
    .limit(1);

  return snapshot ?? { state: null, revision: 0 };
}

export async function saveBoardState(
  boardId: string,
  state: PersistedBoardState,
  expectedRevision: number,
): Promise<{ revision: number }> {
  const userId = await getAuthenticatedUserId();
  if (!userId || !(await canAccessBoard(boardId, userId))) {
    throw new Error("Board not found or access denied");
  }

  const [snapshot] = await db
    .insert(drawingBoardState)
    .values({ board_id: boardId, state, revision: expectedRevision + 1 })
    .onConflictDoUpdate({
      target: drawingBoardState.board_id,
      set: {
        state,
        revision: sql`${drawingBoardState.revision} + 1`,
        content_version: 1,
        updated_at: new Date(),
      },
      where: eq(drawingBoardState.revision, expectedRevision),
    })
    .returning({ revision: drawingBoardState.revision });

  if (!snapshot) {
    throw new Error("Board changed elsewhere; reload before saving");
  }

  return snapshot;
}