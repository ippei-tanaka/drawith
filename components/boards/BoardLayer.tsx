import { useSortable } from '@dnd-kit/react/sortable';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  renameLayer,
  setActiveLayer,
  setLayerVisibility,
  DrawingTool,
} from "@/lib/store/boardSlice";
import type { Layer } from "@/lib/store/boardSlice";

export function BoardLayer (
  {layer, index, isActive}: 
  {layer: Layer, index: number, isActive: boolean}) 
{
  const dispatch = useAppDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const { id, name, visible, opacity } = layer;

  const {ref, isDragging, isDropTarget} = useSortable({
    id,
    index,
    type: 'layer',
    accept: 'layer',
    group: 'layers',
    data: {
      id,
      hasDropTarget: () => isDropTarget
    }
  });

  const commitName = (layerId: string, name: string) => {
    const nextName = name.trim();
    if (nextName) dispatch(renameLayer({ id: layerId, name: nextName }));
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;

    const previewSize = 34;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = previewSize * pixelRatio;
    canvas.height = previewSize * pixelRatio;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, previewSize, previewSize);

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
    const padding = 2;
    const scale = (previewSize - padding * 2) / contentSize;
    const offsetX = (previewSize - contentSize * scale) / 2 - minX * scale;
    const offsetY = (previewSize - contentSize * scale) / 2 - minY * scale;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = opacity;

    for (const stroke of strokes) {
      const [first, ...rest] = stroke.points;
      context.globalCompositeOperation = stroke.tool === DrawingTool.Eraser
        ? "destination-out"
        : "source-over";
      context.strokeStyle = `#${stroke.color.toString(16).padStart(6, "0")}`;
      context.fillStyle = context.strokeStyle;

      const drawPoint = (point: typeof first) => {
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
  }, [layer, opacity]);

  return (
    <div 
      className={`
        bly-layer-item ${isDragging ? "bly-layer-dragging" : ""} 
        ${isDragging && !isDropTarget ? "bly-layer-has-no-drop-target" : ""}
        ${isActive ? "bly-layer-active" : ""}
      `}
      data-has-drop-target={isDropTarget}
      ref={ref}
      onClick={() => dispatch(setActiveLayer(String(id)))}
    >
      
      <canvas
        ref={previewRef}
        className="bly-layer-preview"
        aria-label={`Preview of ${name}`}
      />
      
      {!isEditingName && 
        <span 
          className="bly-layer-name"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditingName(true);
          }}
          >{name}</span>
      }
      {isEditingName && 
        <input
          autoFocus
          className="bly-layer-name-input"
          defaultValue={name}
          onBlur={(event) => {
            commitName(id, event.currentTarget.value);
            setIsEditingName(false);
          }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setIsEditingName(false);
          }}
          aria-label={`Rename ${name}`}/>
      }

      <span 
        className="bly-layer-visibility"
        role="button"
        tabIndex={0}
        aria-label={visible ? `Hide ${name}` : `Show ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setLayerVisibility({ id, visible: !visible }));
        }}>
        {visible 
        ? <Image src="/eye-open.svg" alt="Layer visible" aria-label="Layer visible" width={16} height={16} /> 
        : <Image src="/eye-closed.svg" alt="Layer hidden" aria-label="Layer hidden" width={16} height={16} /> }
      </span>
    </div>
  )
}