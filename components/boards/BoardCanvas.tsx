"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/hooks";
import { User } from "better-auth";
import { BoardApplication } from "@/drawing-board/BoardApplication";

type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function BoardCanvas({ board, user }: { board: Board, user: User }) 
{
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<BoardApplication | null>(null);
  const store = useAppStore();

  useEffect(() => {
    if (!containerRef.current) throw new Error("Container ref is not available");

    let destroied = false;

    (async () => {
      const app = new BoardApplication(store);

      await app.init({
        resizeTo: containerRef.current!,
      });

      // if the component was destroyed (the cleanup callback was called) 
      // before the app finished initializing, destroy the app immediately
      if (destroied) {
        app.destroy();
        return;
      }

      appRef.current = app;
      containerRef.current!.appendChild(app.canvas);
    })();

    return () => {
      destroied = true;
      appRef.current?.destroy();
      containerRef.current = null;
    };
  }, []);

  return (
    <div className="bcv-canvas-area">
      <div ref={containerRef} className="bcv-drawing-canvas" aria-label="Collaborative drawing canvas" />
    </div>
  );
}
