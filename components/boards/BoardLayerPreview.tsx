import { useEffect, useRef } from "react";
import { DrawingTool, type Layer, type PointerSample } from "@/lib/store/boardSlice";

const PREVIEW_SIZE = 34;
const PREVIEW_PADDING = 2;

export function BoardLayerPreview({ layer }: { layer: Layer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = PREVIEW_SIZE * pixelRatio;
    canvas.height = PREVIEW_SIZE * pixelRatio;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    const strokes = layer.strokes.filter(stroke => stroke.points.length > 0);
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
    const scale = (PREVIEW_SIZE - PREVIEW_PADDING * 2) / contentSize;
    const offsetX = (PREVIEW_SIZE - contentSize * scale) / 2 - minX * scale;
    const offsetY = (PREVIEW_SIZE - contentSize * scale) / 2 - minY * scale;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = layer.opacity;

    for (const stroke of strokes) {
      const [first, ...rest] = stroke.points;
      context.globalCompositeOperation = stroke.tool === DrawingTool.Eraser
        ? "destination-out"
        : "source-over";
      context.strokeStyle = `#${stroke.color.toString(16).padStart(6, "0")}`;
      context.fillStyle = context.strokeStyle;

      const drawPoint = (point: PointerSample) => {
        const x = point.x * scale + offsetX;
        const y = point.y * scale + offsetY;
        const radius = (stroke.size * point.pressure * scale) / 2;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      };

      if (!first) continue;
      if (rest.length === 0) {
        drawPoint(first);
        continue;
      }

      context.beginPath();
      context.moveTo(first.x * scale + offsetX, first.y * scale + offsetY);
      for (const point of rest) {
        context.lineWidth = stroke.size * ((first.pressure + point.pressure) / 2) * scale;
        context.lineTo(point.x * scale + offsetX, point.y * scale + offsetY);
      }
      context.stroke();
    }
  }, [layer]);

  return (
    <canvas
      ref={canvasRef}
      className="bly-layer-preview"
      aria-label={`Preview of ${layer.name}`}
    />
  );
}
