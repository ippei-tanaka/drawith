import { getUser } from "@/lib/auth/actions";
import { notFound, redirect } from "next/navigation";
import { findBoardByName } from "../../../../../actions/board-actions";
import { Board } from "./Board";
import "@/styles/board.css";

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

  return <Board board={board} user={user} />;
}