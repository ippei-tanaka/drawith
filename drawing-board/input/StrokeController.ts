import { Container, FederatedPointerEvent, Graphics } from "pixi.js";
import { BasicBrush, Stroke } from "../drawing/BasicBrush";
import { iterateSegment } from "../drawing/iterateSegment";
import { Viewport } from "../viewport/Viewport";

export class StrokeController 
{
  private drawing = false;
  private currentStroke: Stroke | null = null;
  // private strokes: Stroke[] = [];

  constructor(
    private stage: Container,
    private viewport: Viewport,
    private graphics: Graphics,
    private brush: BasicBrush
  ) {}

  init() 
  {
    this.stage.on("pointerdown", this.pointerDown);
    this.stage.on("pointermove", this.pointerMove);
    this.stage.on("pointerup", this.pointerUp);
    this.stage.on("pointerupoutside", this.pointerUp);
  }

  clear() {
    this.stage.off("pointerdown", this.pointerDown);
    this.stage.off("pointermove", this.pointerMove);
    this.stage.off("pointerup", this.pointerUp);
    this.stage.off("pointerupoutside", this.pointerUp);
  };

  private pointerDown = (event: FederatedPointerEvent) => {
    if (event.button !== 0) return;

    const point = this.getPoint(event);

    this.drawing = true;

    this.currentStroke = {
      points: [point],
    };

    this.brush.drawPoint(
      this.graphics,
      point.x,
      point.y,
      point.pressure,
    );
  }

  private pointerMove = (event: FederatedPointerEvent) => {
    if (!this.drawing || !this.currentStroke) return;

    const point = this.getPoint(event);

    const lastPoint =
      this.currentStroke.points[
        this.currentStroke.points.length - 1
      ];

    iterateSegment(
      lastPoint,
      point,
      2,
      (x, y) => {
        this.brush.drawPoint(
          this.graphics,
          x,
          y,
          point.pressure,
        );
      },
    );

    this.currentStroke.points.push(point);
  }

  private pointerUp = () => {
    if (!this.drawing) return;

    this.drawing = false;
    this.currentStroke = null;
  }

  private getPoint(event: FederatedPointerEvent) {
    const local = this.viewport.documentPoint(
      event.screenX,
      event.screenY,
    );

    return {
      x: local.x,
      y: local.y,
      pressure: event.pressure ?? 1,
    };
  }
}