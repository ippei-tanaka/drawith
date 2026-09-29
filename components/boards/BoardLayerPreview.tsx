"use client";

import { useEffect, useRef } from "react";
import { Application, Container } from "pixi.js";
import { StrokeRenderer } from "@/drawing-board/renderers/StrokeRenderer";
import type { Layer } from "@/lib/store/boardSlice";

const PREVIEW_SIZE = 34;
const PREVIEW_PADDING = 2;

export function BoardLayerPreview({ layer }: { layer: Layer }) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    let application: Application | null = null;
    let cancelled = false;
    const strokes = layer.strokes.filter(stroke => stroke.points.length > 0);

    const render = async () => {
      const nextApplication = new Application();
      await nextApplication.init({
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        antialias: true,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (cancelled) {
        nextApplication.destroy(true, true);
        return;
      }

      application = nextApplication;
      preview.replaceChildren(nextApplication.canvas);

      if (strokes.length === 0) return;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const stroke of strokes) {
        for (const point of stroke.points) {
          const radius = (stroke.size * point.pressure) / 2;
          minX = Math.min(minX, point.x - radius);
          minY = Math.min(minY, point.y - radius);
          maxX = Math.max(maxX, point.x + radius);
          maxY = Math.max(maxY, point.y + radius);
        }
      }

      const contentSize = Math.max(maxX - minX, maxY - minY);
      const scale = contentSize > 0
        ? (PREVIEW_SIZE - PREVIEW_PADDING * 2) / contentSize
        : 1;
      const offsetX = (PREVIEW_SIZE - contentSize * scale) / 2 - minX * scale;
      const offsetY = (PREVIEW_SIZE - contentSize * scale) / 2 - minY * scale;
      const strokeContainer = new Container();
      strokeContainer.position.set(offsetX, offsetY);
      strokeContainer.scale.set(scale);
      strokeContainer.alpha = layer.opacity;
      nextApplication.stage.addChild(strokeContainer);

      for (const stroke of strokes) {
        strokeContainer.addChild(new StrokeRenderer(stroke).graphics);
      }
      nextApplication.render();
    };

    void render();

    return () => {
      cancelled = true;
      application?.destroy(true, true);
      application = null;
      preview.replaceChildren();
    };
  }, [layer]);

  return (
    <div
      ref={previewRef}
      className="bly-layer-preview"
      aria-label={`Preview of ${layer.name}`}
    />
  );
}
