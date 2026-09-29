"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/hooks";
import {
  hydrateBoard,
  addLayer,
  clearLayer,
  removeLayer,
  reorderLayers,
  setLayerVisibility,
  setLayerOpacity,
  addStrokeToActiveLayer,
  clearBoard,
  type PersistedBoardState,
} from "@/lib/store/boardSlice";
import { isAnyOf } from "@reduxjs/toolkit";
import { listenerMiddleware } from "@/lib/store/store";
import { saveBoardState } from "@/lib/db/board-state-actions";
import { BoardApplication } from "@/drawing-board/BoardApplication";
import "@/styles/board/board-canvas.css";

type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function BoardCanvas({
  board,
  boardState,
  boardRevision,
}: {
  board: Board;
  boardState: PersistedBoardState | null;
  boardRevision: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useAppStore();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    store.dispatch(clearBoard());

    if (boardState) {
      store.dispatch(hydrateBoard(boardState));
    }

    let revision = boardRevision;
    const stopPersistence = listenerMiddleware.startListening({
      matcher: isAnyOf(
        addLayer,
        clearLayer,
        removeLayer,
        reorderLayers,
        setLayerVisibility,
        setLayerOpacity,
        addStrokeToActiveLayer
      ),
      effect: async (_, listenerApi) => {
        listenerApi.cancelActiveListeners();
        await listenerApi.delay(750);

        try {
          const { layerStack } = listenerApi.getState().board;
          const result = await saveBoardState(
            board.id,
            { layerStack },
            revision,
          );
          revision = result.revision;
        } catch (error) {
          console.error("Unable to save board state", error);
        }
      },
    });

    let destroied = false;
    let app: BoardApplication | null = null;
    let canvas: HTMLCanvasElement | null = null;

    (async () => {
      app = new BoardApplication(store);

      await app.init({
        resizeTo: container,
      });
      canvas = app.canvas;

      // if the component was destroyed (the cleanup callback was called)
      // before the app finished initializing, destroy the app immediately
      if (destroied) {
        app.destroy();
        canvas.remove();
        return;
      }

      container.appendChild(canvas);
    })();

    return () => {
      destroied = true;
      stopPersistence();
      if (app && canvas) {
        app.destroy();
        canvas.remove();
      }
    };
  }, [board.id, boardRevision, boardState, store]);

  return (
    <div className="bcv-canvas-area">
      <div
        ref={containerRef}
        className="bcv-drawing-canvas"
        aria-label="Collaborative drawing canvas"
      />
    </div>
  );
}
