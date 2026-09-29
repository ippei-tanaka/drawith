"use client";

import { useEffect, useRef } from "react";
import { Application, Container } from "pixi.js";
import { loadBoardState } from "@/lib/db/board-state-actions";
import { StrokeRenderer } from "@/drawing-board/renderers/StrokeRenderer";
import type { Stroke } from "@/lib/store/boardSlice";

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 151;
const PREVIEW_PADDING = 18;

export function BoardPreview({ boardId, boardName }: { boardId: string; boardName: string }) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    let application: Application | null = null;
    let cancelled = false;

    const destroyApplication = (nextApplication: Application) => {
      nextApplication.destroy({ removeView: true }, { children: true });
    };

    const render = async () => {
      const result = await loadBoardState(boardId);
      if (cancelled) return;

      const nextApplication = new Application();
      await nextApplication.init({
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        antialias: true,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (cancelled) {
        destroyApplication(nextApplication);
        return;
      }

      application = nextApplication;
      preview.replaceChildren(nextApplication.canvas);

      const layers = result.state?.layerStack.layers ?? [];
      const strokes = layers
        .filter(layer => layer.visible)
        .flatMap(layer => layer.strokes)
        .filter(stroke => stroke.points.length > 0);

      if (strokes.length === 0) return;

      const bounds = getStrokeBounds(strokes);
      const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
      const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
      const scale = Math.min(
        (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / contentWidth,
        (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / contentHeight,
      );
      const offsetX = (PREVIEW_WIDTH - contentWidth * scale) / 2 - bounds.minX * scale;
      const offsetY = (PREVIEW_HEIGHT - contentHeight * scale) / 2 - bounds.minY * scale;

      const strokeContainer = new Container();
      strokeContainer.position.set(offsetX, offsetY);
      strokeContainer.scale.set(scale);
      nextApplication.stage.addChild(strokeContainer);

      for (const layer of layers) {
        if (!layer.visible) continue;

        const layerContainer = new Container();
        layerContainer.alpha = layer.opacity;
        strokeContainer.addChild(layerContainer);

        for (const stroke of layer.strokes) {
          layerContainer.addChild(new StrokeRenderer(stroke).graphics);
        }
      }

      nextApplication.render();
    };

    void render().catch(error => {
      if (!cancelled) {
        console.error("Unable to render board preview", error);
      }
    });

    return () => {
      cancelled = true;
      if (application) {
        destroyApplication(application);
      }
      application = null;
      preview.replaceChildren();
    };
  }, [boardId]);

  return (
    <div
      ref={previewRef}
      className="board-preview"
      aria-label={`Preview of ${boardName}`}
    />
  );
}

function getStrokeBounds(strokes: Stroke[]) {
  return strokes.reduce(
    (bounds, stroke) => {
      for (const point of stroke.points) {
        const radius = (stroke.size * point.pressure) / 2;
        bounds.minX = Math.min(bounds.minX, point.x - radius);
        bounds.minY = Math.min(bounds.minY, point.y - radius);
        bounds.maxX = Math.max(bounds.maxX, point.x + radius);
        bounds.maxY = Math.max(bounds.maxY, point.y + radius);
      }
      return bounds;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
}