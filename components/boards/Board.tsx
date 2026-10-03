"use client";

import { BoardHeader } from "./BoardHeader";
import { BoardToolBox } from "./BoardToolBox";
import { BoardCanvas } from "./BoardCanvas";
import { BoardLayers } from "./BoardLayers";
import type { PersistedBoardState } from "@/lib/store/boardSlice";

type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function Board({
  board,
  boardState,
  boardRevision,
}: {
  board: Board;
  boardState: PersistedBoardState | null;
  boardRevision: number;
}) {
  return (
    <main className="bd-page-container">
      <BoardHeader board={board} />
      <section className="bd-main-workspace">
        <div className="bd-toolbox-container">
          <BoardToolBox />
        </div>
        <div className="bd-canvas-container">
          <BoardCanvas board={board} boardState={boardState} boardRevision={boardRevision} />
        </div>
        <div className="bd-layers-container">
          <BoardLayers />
        </div>
      </section>
    </main>
  );
}
