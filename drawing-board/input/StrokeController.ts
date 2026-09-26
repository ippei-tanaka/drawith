import { Container, FederatedPointerEvent } from "pixi.js";
import type { AppStore } from "@/lib/store/store";
import { addStrokeToActiveLayer, setTool, type Stroke } from "@/lib/store/boardSlice";
import { listenerMiddleware } from "@/lib/store/store";
import { StrokeRenderer } from "../renderers/StrokeRenderer";
import { nanoid } from "@reduxjs/toolkit";

export class StrokeController {
  private drawing = false;
  private currentStroke: Stroke | null = null;
  private currentRenderer: StrokeRenderer | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private surface: Container,
    private drawingContainer: Container,
    private store: AppStore,
  ) { }

  init() {
    if (this.store.getState().board.tool === "pen") {
      this.activate();
    }

    this.unsubscribe = listenerMiddleware.startListening({
      actionCreator: setTool,
      effect: (action) => {
        if (action.payload === "pen") {
          this.activate();
        } else {
          this.deactivate();
        }
      }
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

  private pointerDown = (event: FederatedPointerEvent) => 
  {
    if (event.button !== 0) {
      return;
    }

    const state = this.store.getState().board;

    if (!state.layerStack.activeLayerId) {
      return;
    }

    const {
      size,
      color,
      opacity,
      tool,
      smoothness,
    } = state.brushSettings;

    const point = this.getPoint(event);

    this.currentStroke = {
      points: [point],
      size,
      color,
      opacity,
      tool,
      smoothness,
      id: nanoid()
    };

    this.currentRenderer =
      new StrokeRenderer(
        this.drawingContainer,
        this.currentStroke
      );

    this.drawing = true;
  };

  private pointerMove = (
    event: FederatedPointerEvent
  ) => {
    if (
      !this.drawing ||
      !this.currentStroke ||
      !this.currentRenderer
    ) {
      return;
    }

    const point =
      this.getPoint(event);

    this.currentRenderer.appendPoint(point);
  };

  private pointerUp = () => {
    if (
      !this.drawing ||
      !this.currentStroke
    ) {
      return;
    }

    const stroke =
      this.currentStroke;

    /*
     * Commit the stroke to Redux.
     *
     * addStrokeToActiveLayer.prepare()
     * will generate the permanent stroke ID.
     */
    this.store.dispatch(
      addStrokeToActiveLayer(stroke)
    );

    /*
     * The temporary renderer is no longer needed.
     *
     * LayerRenderer will create the permanent
     * StrokeRenderer when it sees the new stroke.
     */
    this.currentRenderer?.destroy();

    this.currentRenderer = null;
    this.currentStroke = null;
    this.drawing = false;
  };

  private cancelCurrentStroke() {
    this.currentRenderer?.destroy();

    this.currentRenderer = null;
    this.currentStroke = null;
    this.drawing = false;
  }

  private getPoint(
    event: FederatedPointerEvent
  ) {
    return {
      x: event.screenX,
      y: event.screenY,
      pressure: event.pressure ?? 1,
    };
  }
}