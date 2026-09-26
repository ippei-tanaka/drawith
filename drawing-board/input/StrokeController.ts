import { Container, FederatedPointerEvent } from "pixi.js";
import type { AppStore } from "@/lib/store/store";
import {
  addStrokeToActiveLayer,
  eraseAtActiveLayer,
  setTool,
  type PointerSample,
  type Stroke,
} from "@/lib/store/boardSlice";
import { listenerMiddleware } from "@/lib/store/store";
import { StrokeRenderer } from "../renderers/StrokeRenderer";
import { Viewport } from "../viewport/Viewport";
import { nanoid } from "@reduxjs/toolkit";

export class StrokeController {
  private drawing = false;
  private currentStroke: Stroke | null = null;
  private currentRenderer: StrokeRenderer | null = null;
  private lastEraserPoint: PointerSample | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private surface: Container,
    private drawingContainer: Container,
    private viewport: Viewport,
    private store: AppStore,
  ) {}

  init() {
    if (["pen", "eraser"].includes(this.store.getState().board.tool)) {
      this.activate();
    }

    this.unsubscribe = listenerMiddleware.startListening({
      actionCreator: setTool,
      effect: (action) => {
        if (action.payload === "eraser") {
          // this.cancelCurrentStroke();
          this.activate();
        } else if (action.payload === "pen") {
          this.activate();
        } else {
          this.deactivate();
        }
      },
    });
  }

  activate() {
    this.surface.on("pointerdown", this.pointerDown);
    this.surface.on("pointermove", this.pointerMove);
    this.surface.on("pointerup", this.pointerUp);
    this.surface.on("pointerupoutside", this.pointerUp);
  }

  deactivate() {
    this.surface.off("pointerdown", this.pointerDown);
    this.surface.off("pointermove", this.pointerMove);
    this.surface.off("pointerup", this.pointerUp);
    this.surface.off("pointerupoutside", this.pointerUp);

    // Don't leave a temporary stroke behind
    // if the tool changes while drawing.
    this.cancelCurrentStroke();
  }

  cleanup() {
    this.deactivate();
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  setContainer(container: Container) {
    this.drawingContainer = container;
  }

  private pointerDown = (event: FederatedPointerEvent) => {
    if (event.button !== 0) {
      return;
    }

    const state = this.store.getState().board;

    if (!state.layerStack.activeLayerId) {
      return;
    }

    const { size, color, opacity, tool, smoothness } = state.brushSettings;

    const point = this.getPoint(event);

    /*
    if (tool === "eraser") {
      this.cancelCurrentStroke();
      this.lastEraserPoint = point;
      this.drawing = true;
      this.store.dispatch(eraseAtActiveLayer({
        from: point,
        to: point,
        size,
      }));
      return;
    }
      */

    this.cancelCurrentStroke();

    this.currentStroke = {
      points: [point],
      size,
      color,
      opacity,
      tool,
      smoothness,
      id: nanoid(),
    };

    this.currentRenderer = new StrokeRenderer(
      this.drawingContainer,
      this.currentStroke,
    );

    this.drawing = true;
  };

  private pointerMove = (event: FederatedPointerEvent) => {
    /*
    if (
      this.drawing &&
      this.store.getState().board.tool === "eraser"
    ) {
      const point = this.getPoint(event);
      const previous = this.lastEraserPoint || point;

      this.store.dispatch(eraseAtActiveLayer({
        from: previous,
        to: point,
        size: this.store.getState().board.brushSettings.size,
      }));
      this.lastEraserPoint = point;
      return;
    }
    */

    if (!this.drawing || !this.currentStroke || !this.currentRenderer) {
      return;
    }

    const point = this.getPoint(event);

    this.currentRenderer.appendPoint(point);
  };

  private pointerUp = () => {
    /*
    if (this.store.getState().board.tool === "eraser") {
      this.lastEraserPoint = null;
      this.drawing = false;
      return;
    }
      */

    if (!this.drawing || !this.currentStroke) {
      return;
    }

    const stroke = this.currentStroke;

    this.store.dispatch(addStrokeToActiveLayer(stroke));
    this.currentRenderer?.destroy();
    this.currentRenderer = null;
    this.currentStroke = null;
    this.drawing = false;
    this.lastEraserPoint = null;
  };

  private cancelCurrentStroke() {
    this.currentRenderer?.destroy();

    this.currentRenderer = null;
    this.currentStroke = null;
    this.drawing = false;
    this.lastEraserPoint = null;
  }

  private getPoint(event: FederatedPointerEvent) {
    const point = this.viewport.documentPoint(event.global.x, event.global.y);

    return {
      x: point.x,
      y: point.y,
      pressure: event.pressure ?? 1,
    };
  }
}
