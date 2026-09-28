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

export function Board({ board, user }: { board: Board; user: User }) {
  return (
    <main className="bd-page-container">
      <BoardHeader board={board} />
      <section className="bd-main-workspace">
        <div className="bd-toolbox-container">
          <BoardToolBox />
        </div>
        <div className="bd-canvas-container">
          <BoardCanvas board={board} user={user} />
        </div>
        <div className="bd-layers-container">
          <BoardLayers />
        </div>
      </section>
    </main>
  );
}
