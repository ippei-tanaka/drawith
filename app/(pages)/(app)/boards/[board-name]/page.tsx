import { getUser } from "@/lib/auth/actions";
import { notFound, redirect } from "next/navigation";
import { findBoardByName } from "@/actions/board-actions";
import { loadBoardState } from "@/lib/db/board-state-actions";
import { Board } from "@/components/boards/Board";
import "@/styles/board/board.css";

export default async function BoardPage({ params }: { params: Promise<{ 'board-name': string }> }) {
  const _params = await params;
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const board = await findBoardByName(_params["board-name"]);

  if (!board) {
    notFound();
  };

  const boardState = await loadBoardState(board.id);

  return <Board board={board} boardState={boardState.state} boardRevision={boardState.revision} />;
}