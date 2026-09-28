"use client";

import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { DrawingTool, setTool, setColor, setSize, setZoom } from "@/lib/store/boardSlice";
import "@/styles/board/board-toolbox.css";

export function BoardToolBox() 
{
  const dispatch = useAppDispatch();
  const tool = useAppSelector(state => state.board.tool);
  const color = useAppSelector(state => state.board.brushSettings.color);
  const size = useAppSelector(state => state.board.brushSettings.size);
  const zoom = useAppSelector(state => state.board.zoom);

  return (
    <aside className="btb-toolbar" aria-label="Drawing tools">
      <button className={`btb-tool-button ${tool === "pan" ? "btb-selected" : ""}`} onClick={() => dispatch(setTool("pan"))} aria-label="Pan" title="Pan"><Image src="/hand.svg" alt="Pan" width={24} height={24} /></button>
      <button className={`btb-tool-button ${tool === DrawingTool.Pen ? "btb-selected" : ""}`} onClick={() => dispatch(setTool(DrawingTool.Pen))} aria-label="Pen" title="Pen"><Image src="/pen.svg" alt="Pen" width={24} height={24} /></button>
      {/* <button className={`btb-tool-button btb-marker-tool ${tool === "marker" ? "btb-selected" : ""}`} onClick={() => dispatch(setTool("marker"))} aria-label="Highlighter" title="Highlighter">&#9644;</button> */}
      <button className={`btb-tool-button ${tool === DrawingTool.Eraser ? "btb-selected" : ""}`} onClick={() => dispatch(setTool(DrawingTool.Eraser))} aria-label="Eraser" title="Eraser"><Image src="/eraser.svg" alt="Eraser" width={24} height={24} /></button>
      <span className="btb-tool-divider" />
      <label className="btb-color-button" title="Ink color"><span style={{ backgroundColor: `#${color.toString(16).padStart(6, "0")}` }} /><input aria-label="Ink color" type="color" value={`#${color.toString(16).padStart(6, "0")}`} onChange={(event) => dispatch(setColor(Number.parseInt(event.target.value.slice(1), 16)))} /></label>
      <label className="btb-size-control" title="Stroke size"><input type="text" className="btb-size-text" value={size} onChange={(event) => dispatch(setSize(Number(event.target.value)))} /><input aria-label="Stroke size" type="range" min="2" max="200" value={size} onChange={(event) => dispatch(setSize(Number(event.target.value)))} /></label>
      <span className="btb-tool-divider" />
      <div className="btb-zoom-control">
        <input className="btb-zoom-input" type="number" min="10" max="400" step="10" aria-label="Zoom level" title="Zoom level" value={zoom.level} onChange={(event) => {
          const nextZoom = Number(event.target.value);
          if (Number.isFinite(nextZoom)) dispatch(setZoom({ ...zoom, level: nextZoom }));
        }} />
        <span className="btb-zoom-input-unit">%</span>
      </div>
      {/* <button className="btb-tool-button" onClick={undo} aria-label="Undo" title="Undo">&#8629;</button><button className="btb-tool-button" onClick={clearCanvas} aria-label="Clear canvas" title="Clear canvas">&#128465;</button> */}
    </aside>
  );
}
