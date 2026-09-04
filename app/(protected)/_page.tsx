"use client";

import { useEffect, useRef, useState } from "react";
import { drawingBoard } from "@/src/schema";
import { db } from "@/src/db";

type Tool = "pen" | "marker" | "eraser";

const collaborators = [
  { name: "Maya Chen", initials: "MC", color: "#f27a61", status: "Drawing a shape" },
  { name: "Noah Williams", initials: "NW", color: "#44a99b", status: "Following along" },
  { name: "You", initials: "YO", color: "#4f7cf7", status: "Editing" },
];

export default function Home() 
{
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#24324a");
  const [size, setSize] = useState(5);
  const [collaboratorsOpen, setCollaboratorsOpen] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.fillStyle = "#fffefb";
      context.fillRect(0, 0, width, height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const pointForEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  
  const saveHistory = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) historyRef.current.push(context.getImageData(0, 0, canvas.width, canvas.height));
  };
  
  const beginDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    saveHistory(); 
    drawingRef.current = true; 
    lastPoint.current = pointForEvent(event);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPoint.current) return;
    
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const nextPoint = pointForEvent(event);
    context.lineCap = "round"; context.lineJoin = "round";
    context.lineWidth = tool === "marker" ? size * 3 : size;
    context.globalAlpha = tool === "marker" ? 0.28 : 1;
    context.strokeStyle = tool === "eraser" ? "#fffefb" : color;
    context.beginPath(); context.moveTo(lastPoint.current.x, lastPoint.current.y);
    context.lineTo(nextPoint.x, nextPoint.y); context.stroke(); context.globalAlpha = 1;
    lastPoint.current = nextPoint;
  };
  
  const stopDrawing = () => { drawingRef.current = false; lastPoint.current = null; };
  
  const undo = () => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); const snapshot = historyRef.current.pop();
    if (canvas && context && snapshot) context.putImageData(snapshot, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    saveHistory(); context.fillStyle = "#fffefb"; context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return <main className="drawith-app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">D</span><span>drawith</span></div>
      <div className="room-title"><span className="room-dot" /><span>Friday brainstorm</span><button className="icon-button" aria-label="Rename board" title="Rename board">&#9998;</button></div>
      <div className="top-actions"><button className="share-button">Share board</button><button className="avatar avatar-you" aria-label="Your profile">YO</button></div>
    </header>
    <section className="workspace">
      <aside className="toolbar" aria-label="Drawing tools">
        <button className={`tool-button ${tool === "pen" ? "selected" : ""}`} onClick={() => setTool("pen")} aria-label="Pen" title="Pen">&#9998;</button>
        <button className={`tool-button marker-tool ${tool === "marker" ? "selected" : ""}`} onClick={() => setTool("marker")} aria-label="Highlighter" title="Highlighter">&#9644;</button>
        <button className={`tool-button ${tool === "eraser" ? "selected" : ""}`} onClick={() => setTool("eraser")} aria-label="Eraser" title="Eraser">&#9003;</button><span className="tool-divider" />
        <label className="color-button" title="Ink color"><span style={{ backgroundColor: color }} /><input aria-label="Ink color" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label>
        <label className="size-control" title="Stroke size"><span className="size-dot" style={{ width: size + 3, height: size + 3 }} /><input aria-label="Stroke size" type="range" min="2" max="14" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label><span className="tool-divider" />
        <button className="tool-button" onClick={undo} aria-label="Undo" title="Undo">&#8629;</button><button className="tool-button" onClick={clearCanvas} aria-label="Clear canvas" title="Clear canvas">&#128465;</button>
      </aside>
      <div className="canvas-area">
        <div className="canvas-label">Everyone&apos;s ideas land here.</div>
        <canvas ref={canvasRef} className="drawing-canvas" onPointerDown={beginDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="Collaborative drawing canvas" />
        <div className="remote-cursor maya-cursor"><span>Maya</span><i /></div><div className="remote-cursor noah-cursor"><span>Noah</span><i /></div>
        <div className="canvas-footer"><span>Synced just now</span><span>100%</span></div>
      </div>
      <aside className="people-panel">
        <button className="panel-toggle" onClick={() => setCollaboratorsOpen((open) => !open)} aria-expanded={collaboratorsOpen}><span className="people-icon">&#9678;</span><span>People</span><b>{collaborators.length}</b></button>
        {collaboratorsOpen && <div className="people-list"><p>IN THIS BOARD</p>{collaborators.map((person) => <div className="person" key={person.name}><span className="avatar" style={{ backgroundColor: person.color }}>{person.initials}</span><span><strong>{person.name}</strong><small>{person.status}</small></span><i className="presence" /></div>)}<button className="invite-button">+ Invite someone</button></div>}
      </aside>
    </section>
  </main>;
}
