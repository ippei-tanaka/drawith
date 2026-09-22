"use client";

import { User } from "better-auth";
import { BoardHeader } from "./BoardHeader";
import { BoardToolBox } from "./BoardToolBox";
import { BoardCanvas } from "./BoardCanvas";

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

        <aside className="toolbar" aria-label="Drawing tools">
          <BoardToolBox />
        </aside>

        <div className="canvas-area">
          <BoardCanvas board={board} user={user} />
        </div>
      </section>
    </main>
  );
}
