import BoardCanvas from "../../_page";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/lib/auth/actions";
import { db } from "@/lib/db/db";
import { drawingBoard } from "@/lib/db/schema";

const boardTitles: Record<string, string> = {
  "friday-brainstorm": "Friday brainstorm",
  "product-story-map": "Product story map",
  "weekly-retro": "Weekly retro",
};

export default async function BoardPage({ params }: { params: Promise<{ 'board-id': string }> }) {
  const _params = await params;
  const knownTitle = boardTitles[_params["board-id"]];
  let boardTitle = knownTitle ?? "Untitled board";

  if (!knownTitle) {
    const user = await getUser();
    if (user) {
      const [board] = await db
        .select({ display_name: drawingBoard.display_name })
        .from(drawingBoard)
        .where(and(eq(drawingBoard.id, _params["board-id"]), eq(drawingBoard.owner_id, user.id)))
        .limit(1);
      boardTitle = board?.display_name ?? boardTitle;
    }
  }

  return <BoardCanvas boardTitle={boardTitle} />;
}