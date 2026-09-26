import { Container } from "pixi.js";
import type { AppStore } from "@/lib/store/store";
import type { BoardRenderer } from "../renderers/BoardRenderer";
import { StrokeRenderer } from "../renderers/StrokeRenderer";
import type { Tool } from "@/lib/store/boardSlice";
import {
  addStrokeToActiveLayer,
  DrawingTool,
  setTool,
  type PointerSample,
  type Stroke,
} from "@/lib/store/boardSlice";
import { listenerMiddleware } from "@/lib/store/store";
import { Viewport } from "../viewport/Viewport";
import { nanoid } from "@reduxjs/toolkit";
import { StrokeInputController } from "./StrokeInputController";
import { LayerRenderer } from "../renderers/LayerRenderer";

const DrawingTools = [DrawingTool.Pen, DrawingTool.Eraser];
const isDrawingTool = (tool: Tool) => DrawingTools.includes(tool as DrawingTool);

export class StrokeController {
  private currentStroke: Stroke | null = null;
  private activeLayerRenderer: LayerRenderer | null = null;
  private previewStrokeRenderer: StrokeRenderer | null = null;
  private unsubscribe: (() => void) | null = null;
  private strokeInputController = new StrokeInputController(this.surface);

  constructor(
    private surface: Container,
    private viewport: Viewport,
    private store: AppStore,
    private boardRenderer: BoardRenderer
  ) {}

  init() {
    if (isDrawingTool(this.store.getState().board.tool)) {
      this.activate();
    }

    this.unsubscribe = listenerMiddleware.startListening({
      actionCreator: setTool,
      effect: (action) => {
        if (isDrawingTool(action.payload)) {
          this.activate();
        } else {
          this.deactivate();
        }
      },
    });

    this.strokeInputController.onStart = this.startStroke;
    this.strokeInputController.onMove = this.keepStroke;
    this.strokeInputController.onEnd = this.endStroke;
  }

  activate() {
    this.strokeInputController.activate();
  }

  deactivate() {
    this.strokeInputController.deactivate();
    this.currentStroke = null;
    this.previewStrokeRenderer?.destroy();
    this.previewStrokeRenderer = null;
    this.activeLayerRenderer = null;
  }

  cleanup() {
    this.deactivate();
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private startStroke = (point: PointerSample) => {
    this.activeLayerRenderer = this.boardRenderer.getActiveLayerRenderer();
    if (!this.activeLayerRenderer) {
      return;
    }
    
    const { size, color, opacity, tool, smoothness } = this.store.getState().board.brushSettings;
    
    this.currentStroke = {
      points: [this.transposePoint(point)],
      size,
      color,
      opacity,
      tool,
      smoothness,
      id: nanoid(),
    };
    this.previewStrokeRenderer = new StrokeRenderer(this.currentStroke);
    this.activeLayerRenderer.container.addChild(this.previewStrokeRenderer.graphics); 
  };

  private keepStroke = (point: PointerSample) => {
    if (!this.currentStroke) {
      return;
    }
    const transposedPoint = this.transposePoint(point);
    this.currentStroke.points.push(transposedPoint);
    this.previewStrokeRenderer?.appendPoint(transposedPoint);
  };

  private endStroke = (point: PointerSample) => {
    if (!this.currentStroke) {
      return;
    }
    const transposedPoint = this.transposePoint(point);
    this.currentStroke.points.push(transposedPoint);
    this.previewStrokeRenderer?.appendPoint(transposedPoint);
    this.store.dispatch(addStrokeToActiveLayer(this.currentStroke));
    this.currentStroke = null;
    if (this.previewStrokeRenderer) this.activeLayerRenderer?.container.removeChild(this.previewStrokeRenderer.graphics);
    this.activeLayerRenderer = null;
    this.previewStrokeRenderer?.destroy();
    this.previewStrokeRenderer = null;
  };

  private transposePoint(point: PointerSample) {
    const docPoint = this.viewport.documentPoint(point.x, point.y);
    return {
      x: docPoint.x,
      y: docPoint.y,
      pressure: point.pressure,
    };
  }
}
