import { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import type { AppStore } from "@/lib/store/store";
import { listenerMiddleware } from "@/lib/store/store";
import { addStrokeToActiveLayer, PointerSample, setTool, type Stroke } from "@/lib/store/boardSlice";

export class StrokeController {
  private drawing = false;
  private currentStroke: Omit<Stroke, "id" | "smoothness"> | null = null;
  private currentGraphics: Graphics | null = null;
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
  }

  cleanup() {
    this.deactivate();
    this.unsubscribe?.();
  };

  setContainer(container: Container) {
    this.drawingContainer = container;
  }

  private pointerDown = (event: FederatedPointerEvent) => {
    if (event.button !== 0) return;

    const state = this.store.getState().board;

    if (!state.layerStack.activeLayerId) {
      return;
    }

    const {
      size,
      color,
      opacity,
      tool,
    } = state.brushSettings;

    this.currentStroke = {
      points: [this.getPoint(event)],
      size,
      color,
      opacity,
      tool,
    };

    this.currentGraphics = new Graphics();

    this.drawingContainer.addChild(
      this.currentGraphics
    );

    this.drawing = true;
  };

  private pointerMove = (
    event: FederatedPointerEvent
  ) => {
    if (!this.drawing || !this.currentStroke) {
      return;
    }

    const point = this.getPoint(event);

    this.currentStroke.points.push(point);

    this.drawCurrentSegment(point);
  };

  private drawCurrentSegment(point: PointerSample) {
    if (!this.currentGraphics || !this.currentStroke) {
      return;
    }

    const points = this.currentStroke.points;

    if (points.length < 2) {
      return;
    }

    const previous = points[points.length - 2];

    this.currentGraphics
      .moveTo(previous.x, previous.y)
      .lineTo(point.x, point.y)
      .stroke({
        width: this.currentStroke.size,
        color: this.currentStroke.color,
        alpha: this.currentStroke.opacity,
      });
  }

  private pointerUp = () => {
    if (!this.drawing || !this.currentStroke) {
      return;
    }

    this.currentGraphics?.destroy();
    this.currentGraphics = null;

    this.store.dispatch(
      addStrokeToActiveLayer(this.currentStroke)
    );

    this.currentStroke = null;
    this.drawing = false;
  };

  private getPoint(event: FederatedPointerEvent) {
    return {
      x: event.screenX,
      y: event.screenY,
      pressure: event.pressure ?? 1,
    };
  }

}