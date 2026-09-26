import { Container } from "pixi.js";
import type { Layer, Stroke } from "@/lib/store/boardSlice";
import { StrokeRenderer } from "./StrokeRenderer";

export class LayerRenderer {
  readonly container: Container;
  readonly id: string;

  private strokeRenderers = new Map<string, StrokeRenderer>();

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
    const currentIds = new Set(strokes.map(stroke => stroke.id));

    // Add or update
    for (const stroke of strokes) {
      const renderer = this.strokeRenderers.get(stroke.id);

      if (!renderer) {
        const newRenderer = new StrokeRenderer(this.container, stroke);
        this.strokeRenderers.set(
          stroke.id,
          newRenderer
        );
      } else {
        renderer.update(stroke);
      }
    }

    // Remove
    for (const [id, renderer] of this.strokeRenderers) {
      if (!currentIds.has(id)) {
        renderer.destroy();
        this.strokeRenderers.delete(id);
      }
    }

    // Keep PIXI order equal to Redux order
    strokes.forEach((stroke, index) => {
      const renderer = this.strokeRenderers.get(stroke.id);
      if (renderer) {
        this.container.setChildIndex(
          renderer.graphics,
          index
        );
      }
    });
  }

  destroy() {
    for (const renderer of this.strokeRenderers.values()) {
      renderer.destroy();
    }

    this.strokeRenderers.clear();

    this.container.destroy();
  }
}