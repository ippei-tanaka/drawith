import { Container, FederatedPointerEvent } from "pixi.js";
import { iterateSegment } from "../drawing/iterateSegment";
import { store } from "@/lib/store/store";
import { addStrokeToActiveLayer, type Stroke } from "@/lib/store/boardSlice";

export class StrokeController 
{
  private drawing = false;
  private currentStroke: Omit<Stroke, "id" | "smoothness"> | null = null;

  constructor(
    private surface: Container,
  ) {}

  init() 
  {
    this.surface.on("pointerdown", this.pointerDown);
    this.surface.on("pointermove", this.pointerMove);
    this.surface.on("pointerup", this.pointerUp);
    this.surface.on("pointerupoutside", this.pointerUp);
  }

  activate() {
    this.init();
  }

  deactivate() {
    this.clear();
  }

  clear() {
    this.surface.off("pointerdown", this.pointerDown);
    this.surface.off("pointermove", this.pointerMove);
    this.surface.off("pointerup", this.pointerUp);
    this.surface.off("pointerupoutside", this.pointerUp);
  };

  private pointerDown = (event: FederatedPointerEvent) => 
  {
    if (event.button !== 0) return;

    const { size, color, opacity, tool } = store.getState().board.brushSettings;
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

    const board = store.getState().board;
    // const smoothness = board.brushSetting.smoothness;

    const point = this.getPoint(event);

    // const lastPoint =
    //   this.currentStroke.points[
    //     this.currentStroke.points.length - 1
    //   ];

    // iterateSegment(
    //   lastPoint,
    //   point,
    //   smoothness,
    //   (x, y) => {
    //     this.currentStroke?.points.push({ 
    //       x, 
    //       y, 
    //       pressure: point.pressure
    //     });
    //   },
    // );

    this.currentStroke.points.push(point);
  }

  private pointerUp = () => 
  {
    if (!this.drawing) return;
    if (!this.currentStroke) return;

    store.dispatch(addStrokeToActiveLayer(this.currentStroke));
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