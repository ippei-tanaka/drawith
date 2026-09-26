import { Container, Graphics } from "pixi.js";
import type {
  PointerSample,
  Stroke,
} from "@/lib/store/boardSlice";

export class StrokeRenderer {
  readonly graphics: Graphics;

  private stroke: Stroke;

  constructor(
    private readonly parent: Container,
    stroke: Stroke,
  ) {
    this.stroke = stroke;
    this.graphics = new Graphics();

    this.parent.addChild(this.graphics);

    this.render();
  }

  update(stroke: Stroke) {
    this.stroke = stroke;
    this.render();
  }

  private render() {
    this.graphics.clear();

    const { points } = this.stroke;

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      this.drawDot(points[0]);
      return;
    }

    this.drawStroke(points);
  }

  private drawDot(point: PointerSample) {
    const {
      size,
      color,
      opacity,
    } = this.stroke;

    const radius =
      this.getWidth(point.pressure) / 2;

    this.graphics
      .circle(point.x, point.y, radius)
      .fill({
        color,
        alpha: opacity,
      });
  }

  private drawStroke(points: PointerSample[]) {
    const {
      color,
      opacity,
    } = this.stroke;

    this.graphics.moveTo(
      points[0].x,
      points[0].y,
    );

    for (let i = 1; i < points.length; i++) {
      const point = points[i];

      this.graphics.lineTo(
        point.x,
        point.y,
      );
    }

    this.graphics.stroke({
      width: this.getAverageWidth(points),
      color,
      alpha: opacity,
    });
  }

  private getWidth(pressure: number) {
    return this.stroke.size * pressure;
  }

  private getAverageWidth(
    points: PointerSample[],
  ) {
    const total = points.reduce(
      (sum, point) =>
        sum + this.getWidth(point.pressure),
      0,
    );

    return total / points.length;
  }

  destroy() {
    this.graphics.destroy();
  }
}