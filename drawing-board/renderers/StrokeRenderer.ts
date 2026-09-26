import { Container, Graphics } from "pixi.js";
import type {
  PointerSample,
  Stroke,
} from "@/lib/store/boardSlice";

type RenderableStroke = Stroke;

export class StrokeRenderer {
  readonly graphics: Graphics;

  private stroke: RenderableStroke;

  constructor(
    private readonly parent: Container,
    stroke: RenderableStroke,
  ) {
    this.stroke = stroke;
    this.graphics = new Graphics();
    this.parent.addChild(this.graphics);
    this.render();
  }

  /**
   * Completely redraw the stroke.
   *
   * Used for persisted strokes.
   */
  update(stroke: Stroke) {
    this.stroke = stroke;
    this.render();
  }

  /**
   * Add a point while the user is drawing.
   *
   * This renders incrementally instead of
   * redrawing the entire stroke.
   */
  appendPoint(point: PointerSample) {
    const points = this.stroke.points;

    if (points.length === 0) {
      points.push(point);
      this.drawDot(point);
      return;
    }

    const previous = points[points.length - 1];

    points.push(point);

    /*
     * With only two points, we don't have enough
     * information to create a useful smooth curve.
     */
    if (points.length === 2) {
      this.drawSegment(previous, point);
      return;
    }

    /*
     * The previous straight segment may already have
     * been drawn, so we need to redraw the stroke
     * from the previous stable point.
     *
     * For simplicity, redraw the whole stroke here.
     *
     * Later we can make this fully incremental.
     */
    this.render();
  }

  private render() {
    this.graphics.clear();

    const points = this.stroke.points;

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      this.drawDot(points[0]);
      return;
    }

    if (this.stroke.smoothness <= 0) {
      this.drawPolyline(points);
      return;
    }

    this.drawSmoothStroke(points);
  }

  /**
   * Simple unsmoothed polyline.
   */
  private drawPolyline(
    points: PointerSample[],
  ) {
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];

      this.graphics
        .moveTo(from.x, from.y)
        .lineTo(to.x, to.y)
        .stroke({
          width: this.getWidth(
            (from.pressure + to.pressure) / 2,
          ),
          cap: "round",
          join: "round",
          color: this.stroke.color,
          alpha: this.stroke.opacity,
        });
    }
  }

  /**
   * Draw a smooth stroke using midpoint
   * quadratic Bézier curves.
   *
   * Example:
   *
   * P0 ---- P1 ---- P2 ---- P3
   *
   *       control
   *          P1
   *          ↓
   * P0 ---- curve ---- midpoint(P1,P2)
   */
  private drawSmoothStroke(
    points: PointerSample[],
  ) {
    const first = points[0];
    let start = first;

    for (
      let i = 1;
      i < points.length - 1;
      i++
    ) {
      const current = points[i];
      const next = points[i + 1];

      const midpoint =
        this.getMidpoint(
          current,
          next,
        );

      this.graphics
        .moveTo(start.x, start.y)
        .quadraticCurveTo(
          current.x,
          current.y,
          midpoint.x,
          midpoint.y,
        )
        .stroke({
          width: this.getWidth(
            (start.pressure + midpoint.pressure) / 2,
          ),
          cap: "round",
          join: "round",
          color: this.stroke.color,
          alpha: this.stroke.opacity,
        });

      start = midpoint;
    }

    /*
     * Finish the curve at the final point.
     */
    const last = points[points.length - 1];

    this.graphics
      .moveTo(start.x, start.y)
      .lineTo(last.x, last.y)
      .stroke({
        width: this.getWidth(
          (start.pressure + last.pressure) / 2,
        ),
        cap: "round",
        join: "round",
        color: this.stroke.color,
        alpha: this.stroke.opacity,
      });
  }

  private drawDot(
    point: PointerSample,
  ) {
    const width =
      this.getWidth(point.pressure);

    this.graphics
      .circle(
        point.x,
        point.y,
        width / 2,
      )
      .fill({
        color: this.stroke.color,
        alpha: this.stroke.opacity,
      });
  }

  private drawSegment(
    from: PointerSample,
    to: PointerSample,
  ) {
    const width =
      this.getWidth(
        (from.pressure + to.pressure) / 2,
      );

    this.graphics
      .moveTo(from.x, from.y)
      .lineTo(to.x, to.y)
      .stroke({
        width,
        cap: "round",
        join: "round",
        color: this.stroke.color,
        alpha: this.stroke.opacity,
      });
  }

  private getMidpoint(
    a: PointerSample,
    b: PointerSample,
  ): PointerSample {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      pressure: (a.pressure + b.pressure) / 2,
    };
  }

  private getWidth(
    pressure: number,
  ) {
    return this.stroke.size * pressure;
  }

  destroy() {
    this.graphics.destroy();
  }
}