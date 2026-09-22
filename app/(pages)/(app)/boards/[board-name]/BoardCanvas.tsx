"use client";

import { useEffect, useRef } from "react";
import { User } from "better-auth";
import { Application, Assets, Container, Sprite, Rectangle, Graphics, GraphicsContext, FederatedPointerEvent } from 'pixi.js';

// import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { store } from "@/lib/store/store";


type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function BoardCanvas({ board, user }: { board: Board, user: User }) 
{
  const app = new Application();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<Container | null>(null);
  const graphicsRef = useRef<Graphics | null>(null);
  const isDrawingRef = useRef(false);

  // const drawingRef = useRef(false);
  // const lastPoint = useRef<{ x: number; y: number } | null>(null);
  // const historyRef = useRef<ImageData[]>([]);
  // const tool = useAppSelector(state => state.board.tool);
  // const color = useAppSelector(state => state.board.color);
  // const size = useAppSelector(state => state.board.size);
  // const dispatch = useAppDispatch();

  /*
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
  */

  const handleResize = () => {
    console.log("Window resized");
  };

  const onPointerDown = function (event: FederatedPointerEvent) {
    // console.log(graphic);
    // console.log("Pointer down at:", event.global.x, event.global.y);
    isDrawingRef.current = true;
    graphicsRef.current?.moveTo(event.global.x, event.global.y);
  };

  const onPointerMove = (event: FederatedPointerEvent) => {
    if (isDrawingRef.current) {
      // console.log(12);
      const { tool, size, color } = store.getState().board;
      const g = graphicsRef.current;
      g?.stroke({ 
        width: size, 
        color: color 
      }).lineTo(event.global.x, event.global.y);

      if (tool === "eraser") {
        g?.moveTo(event.global.x, event.global.y)
        .circle(event.global.x, event.global.y, size * 10)
      }
    }
  };

  const onPointerUp = (event: FederatedPointerEvent) => {
    // graphicsRef.current?.lineTo(event.global.x, event.global.y);
    isDrawingRef.current = false;
  };

  useEffect(() => {

    if (!canvasRef.current) 
      throw new Error("Canvas element not found");

    app.init({
      canvas: canvasRef.current,
      width: 800,
      height: 600,
      backgroundColor: 0xdddddd
    }).then(() => {
      containerRef.current = new Container();
      app.stage.addChild(containerRef.current);
      containerRef.current.setSize(800, 600);
      containerRef.current.position.set(0, 0);
      containerRef.current.interactive = true;
      containerRef.current.hitArea = new Rectangle(0, 0, 800, 600);
      containerRef.current.on('pointerdown', onPointerDown);
      containerRef.current.on('pointermove', onPointerMove);
      containerRef.current.on('pointerup', onPointerUp);

      graphicsRef.current = new Graphics();
      containerRef.current.addChild(graphicsRef.current);
      
      window.addEventListener("resize", handleResize);
    });

    return () => {
      if (canvasRef.current) {
        app.destroy(true);
        canvasRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
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
  
  const stopDrawing = () => { 
    drawingRef.current = false; 
    lastPoint.current = null; 
  };
  
  const undo = () => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d"); const snapshot = historyRef.current.pop();
    if (canvas && context && snapshot) context.putImageData(snapshot, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current; const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    saveHistory(); context.fillStyle = "#fffefb"; context.fillRect(0, 0, canvas.width, canvas.height);
  };
  */

  return (
    <canvas ref={canvasRef} className="drawing-canvas" aria-label="Collaborative drawing canvas" />
  );
}
