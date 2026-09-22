"use client";

import { useEffect, useRef, useState } from "react";
import { BoardHeader } from "./BoardHeader";
import { User } from "better-auth";
import { Application, Assets, Container, Sprite, Rectangle, Graphics, GraphicsContext, FederatedPointerEvent } from 'pixi.js';
import { BoardToolBox } from "./BoardToolBox";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";

type Board = {
  id: string;
  name: string;
  display_name: string;
};

export function BoardCanvas({ board, user }: { board: Board, user: User }) 
{
  const app = new Application();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [container, setContainer] = useState<Container | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [graphic, setGraphic] = useState<Graphics | null>(null);
  // const drawingRef = useRef(false);
  // const lastPoint = useRef<{ x: number; y: number } | null>(null);
  // const historyRef = useRef<ImageData[]>([]);
  const tool = useAppSelector(state => state.board.tool);
  const color = useAppSelector(state => state.board.color);
  const size = useAppSelector(state => state.board.size);
  const dispatch = useAppDispatch();

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

  let _graphics: Graphics;

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas element not found");

    app.init({
      canvas,
      width: 800,
      height: 600,
      backgroundColor: 0xffffff
    }).then(() => {
      const _container = new Container();
      _container.setSize(800, 600);
      _container.position.set(0, 0);
      _container.interactive = true;
      _container.hitArea = new Rectangle(0, 0, 800, 600);
      app.stage.addChild(_container);
      setContainer(_container);
      const newGraphic = new Graphics();
      setGraphic(newGraphic);
      _container.addChild(newGraphic);
      window.addEventListener("resize", handleResize);
    });

    return () => {
      if (canvasRef.current) {
        app.destroy(true);
        canvasRef.current = null;
      }
      setContainer(null);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onPointerDown = (event: FederatedPointerEvent) => {
    // console.log(graphic);
    setIsDrawing(true);
    graphic?.moveTo(event.global.x, event.global.y);
  };

  const onPointerMove = (event: FederatedPointerEvent) => {
    if (isDrawing) {
      // console.log(12);
      graphic?.lineTo(event.global.x, event.global.y);

      if (tool === "eraser") {
        // console.log(12313221);
        graphic?.stroke({ width: size }).cut();
      } else {
        graphic?.stroke({ width: size, color });
      }
    }
  };

  const onPointerUp = (event: FederatedPointerEvent) => {
    graphic?.lineTo(event.global.x, event.global.y);
    setIsDrawing(false);
  };

  useEffect(() => {
    container?.on('pointerdown', onPointerDown);
    container?.on('pointermove', onPointerMove);
    container?.on('pointerup', onPointerUp);
    return () => {
      container?.off('pointerdown', onPointerDown);
      container?.off('pointermove', onPointerMove);
      container?.off('pointerup', onPointerUp);
    };
  }, [container, graphic, isDrawing]);

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
