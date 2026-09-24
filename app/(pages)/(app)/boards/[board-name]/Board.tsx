"use client";

import { User } from "better-auth";
import { BoardHeader } from "./BoardHeader";
import { BoardToolBox } from "./BoardToolBox";
import { BoardCanvas } from "./BoardCanvas";
import { BoardLayers } from "./BoardLayers";

type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function Board({ board, user }: { board: Board, user: User }) 
{
  return (
    <main className="drawith-app">
      <BoardHeader board={board} />
      <section className="workspace">
        <BoardToolBox />
        <BoardCanvas board={board} user={user} />
        <BoardLayers />
      </section>
    </main>
  );
}
