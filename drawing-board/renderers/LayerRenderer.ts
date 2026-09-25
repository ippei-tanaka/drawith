import { Container, Graphics } from "pixi.js";
import type { Layer, Stroke } from "@/lib/store/boardSlice";

export class LayerRenderer 
{
  readonly container: Container;
  readonly id: string;

  private strokeGraphics = new Map<string, Graphics>();
  private renderedStrokes = new Map<string, Stroke>();

  constructor(
    private readonly parent: Container,
    layer: Layer,
  ) {
    this.container = new Container();
    this.id = layer.id;

    this.parent.addChild(this.container);

    this.sync(layer);
  }

  sync(layer: Layer) {
    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;

    this.syncStrokes(layer.strokes);
  }

  private syncStrokes(strokes: Stroke[]) {
    const currentIds = new Set(
      strokes.map(stroke => stroke.id)
    );

    // Add new strokes and update changed strokes.
    for (const stroke of strokes) {
      const previousStroke = this.renderedStrokes.get(stroke.id);

      if (!previousStroke) {
        this.addStroke(stroke);
      } else if (previousStroke !== stroke) {
        this.updateStroke(stroke);
      }

      this.renderedStrokes.set(stroke.id, stroke);
    }

    // Remove strokes that no longer exist in Redux.
    for (const [id, graphics] of this.strokeGraphics) {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.strokeGraphics.delete(id);
        this.renderedStrokes.delete(id);
      }
    }

    // Keep PIXI stroke order synchronized with Redux order.
    strokes.forEach((stroke, index) => {
      const graphics = this.strokeGraphics.get(stroke.id);

      if (graphics) {
        this.container.setChildIndex(graphics, index);
      }
    });
  }

  private addStroke(stroke: Stroke) {
    const graphics = new Graphics();

    this.drawStroke(graphics, stroke);

    this.container.addChild(graphics);

    this.strokeGraphics.set(stroke.id, graphics);
  }

  private updateStroke(stroke: Stroke) {
    const graphics = this.strokeGraphics.get(stroke.id);

    if (!graphics) {
      // Should normally not happen, but recover gracefully.
      this.addStroke(stroke);
      return;
    }

    graphics.clear();
    this.drawStroke(graphics, stroke);
  }

  private drawStroke(
    graphics: Graphics,
    stroke: Stroke,
  ) {
    const { points, size, color, opacity } = stroke;

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      const point = points[0];

      graphics
        .circle(point.x, point.y, size / 2)
        .fill({
          color,
          alpha: opacity,
        });

      return;
    }

    // const curve = smoothStroke(
    //   stroke.points,
    //   stroke.smoothness
    // );

    // drawCurve(graphics, curve, stroke);

    graphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const point = points[i];

      graphics.lineTo(point.x, point.y);
    }

    graphics.stroke({
      width: size,
      color,
      alpha: opacity,
    });
  }
  

  destroy() {
    for (const graphics of this.strokeGraphics.values()) {
      graphics.destroy();
    }

    this.strokeGraphics.clear();
    this.renderedStrokes.clear();

    this.container.destroy();
  }
}