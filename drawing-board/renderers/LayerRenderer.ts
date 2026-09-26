import { Container } from "pixi.js";
import type { Layer, Stroke } from "@/lib/store/boardSlice";
import { StrokeRenderer } from "./StrokeRenderer";

export class LayerRenderer {
  readonly container: Container;
  readonly id: string;

  private strokeRenderers = new Map<string, StrokeRenderer>();
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

  private syncStrokes(
    strokes: Stroke[]
  ) {
    const currentIds =
      new Set(
        strokes.map(
          stroke => stroke.id
        )
      );

    /*
     * Add or update strokes.
     */
    for (const stroke of strokes) {
      const renderer =
        this.strokeRenderers.get(
          stroke.id
        );

      if (!renderer) {
        const newRenderer =
          new StrokeRenderer(
            this.container,
            stroke
          );

        this.strokeRenderers.set(
          stroke.id,
          newRenderer
        );

        this.renderedStrokes.set(
          stroke.id,
          stroke
        );

        continue;
      }

      /*
       * Redux Toolkit/Immer creates a new
       * Stroke object when that stroke changes.
       *
       * If the reference hasn't changed,
       * there is nothing to redraw.
       */
      const previous =
        this.renderedStrokes.get(
          stroke.id
        );

      if (previous !== stroke) {
        renderer.update(stroke);

        this.renderedStrokes.set(
          stroke.id,
          stroke
        );
      }
    }

    /*
     * Remove strokes that no longer exist
     * in Redux.
     */
    for (
      const [id, renderer]
      of this.strokeRenderers
    ) {
      if (!currentIds.has(id)) {
        renderer.destroy();

        this.strokeRenderers.delete(id);
        this.renderedStrokes.delete(id);
      }
    }

    /*
     * Keep PIXI's child order synchronized
     * with Redux's stroke order.
     */
    strokes.forEach(
      (stroke, index) => {
        const renderer =
          this.strokeRenderers.get(
            stroke.id
          );

        if (!renderer) {
          return;
        }

        this.container.setChildIndex(
          renderer.graphics,
          index
        );
      }
    );
  }

  destroy() {
    for (
      const renderer
      of this.strokeRenderers.values()
    ) {
      renderer.destroy();
    }

    this.strokeRenderers.clear();
    this.renderedStrokes.clear();

    this.container.destroy();
  }
}