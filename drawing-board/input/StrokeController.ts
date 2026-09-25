import { Container, FederatedPointerEvent } from "pixi.js";
import type { AppStore } from "@/lib/store/store";
import { listenerMiddleware } from "@/lib/store/store";
import { addStrokeToActiveLayer, setTool, type Stroke } from "@/lib/store/boardSlice";

export class StrokeController 
{
  private drawing = false;
  private currentStroke: Omit<Stroke, "id" | "smoothness"> | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private surface: Container,
    private store: AppStore,
  ) {}

  init() 
  {
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

  private pointerDown = (event: FederatedPointerEvent) => 
  {
    if (event.button !== 0) return;

    const { size, color, opacity, tool } = this.store.getState().board.brushSettings;
    const point = this.getPoint(event);

    this.currentStroke = {
      points: [point],
      size: size,
      color: color,
      opacity: opacity,
      tool: tool,
    };
    
    this.drawing = true;
  }

  private pointerMove = (event: FederatedPointerEvent) => 
  {
    if (!this.drawing || !this.currentStroke) return;
    const point = this.getPoint(event);
    this.currentStroke.points.push(point);
  }

  private pointerUp = () => 
  {
    if (!this.drawing) return;
    if (!this.currentStroke) return;

    this.store.dispatch(addStrokeToActiveLayer(this.currentStroke));
    this.drawing = false;
    this.currentStroke = null;
  }

  private getPoint(event: FederatedPointerEvent) 
  {
    return {
      x: event.screenX,
      y: event.screenY,
      pressure: event.pressure ?? 1,
    };
  }
}