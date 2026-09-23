"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setTool, setColor, setSize, setZoom } from "@/lib/store/boardSlice";

import type { BoardTool } from "@/lib/store/boardSlice";


export function BoardToolBox() 
{
  const dispatch = useAppDispatch();
  const tool = useAppSelector(state => state.board.tool);
  const color = useAppSelector(state => state.board.color);
  const size = useAppSelector(state => state.board.size);
  const zoom = useAppSelector(state => state.board.zoom);

  return (
    <>
      <button className={`tool-button ${tool === "pan" ? "selected" : ""}`} onClick={() => dispatch(setTool("pan"))} aria-label="Pan" title="Pan">🖐️</button>
      <button className={`tool-button ${tool === "pen" ? "selected" : ""}`} onClick={() => dispatch(setTool("pen"))} aria-label="Pen" title="Pen">&#9998;</button>
      <button className={`tool-button marker-tool ${tool === "marker" ? "selected" : ""}`} onClick={() => dispatch(setTool("marker"))} aria-label="Highlighter" title="Highlighter">&#9644;</button>
      <button className={`tool-button ${tool === "eraser" ? "selected" : ""}`} onClick={() => dispatch(setTool("eraser"))} aria-label="Eraser" title="Eraser">&#9003;</button><span className="tool-divider" />
      <label className="color-button" title="Ink color"><span style={{ backgroundColor: color }} /><input aria-label="Ink color" type="color" value={color} onChange={(event) => dispatch(setColor(event.target.value))} /></label>
      <label className="size-control" title="Stroke size"><span className="size-dot" style={{ width: size + 3, height: size + 3 }} /><input aria-label="Stroke size" type="range" min="2" max="14" value={size} onChange={(event) => dispatch(setSize(Number(event.target.value)))} /></label><span className="tool-divider" />
      <div className="zoom-control">
        <input className="zoom-input" type="number" min="10" max="400" step="10" aria-label="Zoom level" title="Zoom level" value={zoom} onChange={(event) => {
          const nextZoom = Number(event.target.value);
          if (Number.isFinite(nextZoom)) dispatch(setZoom(nextZoom));
        }} />
        <span className="zoom-input-unit">%</span>
      </div>
      {/* <button className="tool-button" onClick={undo} aria-label="Undo" title="Undo">&#8629;</button><button className="tool-button" onClick={clearCanvas} aria-label="Clear canvas" title="Clear canvas">&#128465;</button> */}
    </>
  );
}
