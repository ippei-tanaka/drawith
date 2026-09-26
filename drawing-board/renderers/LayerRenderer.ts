import { AlphaFilter, Container } from "pixi.js";
import { DrawingTool, type Layer, type Stroke } from "@/lib/store/boardSlice";
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
    this.parent.addChild(this.container);
    this.container.filters = [new AlphaFilter()];
    this.id = layer.id;
    this.sync(layer);
  }

  sync(layer: Layer) {
    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;
    this.syncStrokes(layer.strokes);
  }

  private syncStrokes(strokes: Stroke[]) {
    const currentIds = new Set(strokes.map((stroke) => stroke.id));

    for (const stroke of strokes) {
      const renderer = this.strokeRenderers.get(stroke.id);

      if (!renderer) {
        const newRenderer = new StrokeRenderer(this.container, stroke);

        this.strokeRenderers.set(stroke.id, newRenderer);

        this.renderedStrokes.set(stroke.id, stroke);

        continue;
      }

      const previous = this.renderedStrokes.get(stroke.id);

      if (previous !== stroke) {
        renderer.update(stroke);

        this.renderedStrokes.set(stroke.id, stroke);
      }
    }

    for (const [id, renderer] of this.strokeRenderers) {
      if (!currentIds.has(id)) {
        renderer.destroy();

        this.strokeRenderers.delete(id);
        this.renderedStrokes.delete(id);
      }
    }

    strokes.forEach((stroke, index) => {
      const renderer = this.strokeRenderers.get(stroke.id);
      if (!renderer) {
        return;
      }
      this.container.setChildIndex(renderer.graphics, index);
    });

    // strokes.forEach((stroke, index) => {
    //   const renderer = this.strokeRenderers.get(stroke.id);

    //   if (!renderer) {
    //     return;
    //   }

    //   // this.container.setChildIndex(renderer.graphics, index);
    //   // this.container.setChildIndex(renderer.graphics, index);
    //   this.container.addChild(renderer.graphics);
    //   renderer.graphics.zIndex = index;
    //   // const container = new Container();
    //   // container.addChild(renderer.graphics);
    //   // container.zIndex = index;
    //   // container.sortableChildren = true;
    //   // container.blendMode = "erase";
    //   if (stroke.tool === DrawingTool.Eraser) {
    //     renderer.graphics.blendMode = "erase";
    //   }
    //   // this.container.addChild(container);
    // });
  }

  destroy() {
    for (const renderer of this.strokeRenderers.values()) {
      renderer.destroy();
    }

    this.strokeRenderers.clear();
    this.renderedStrokes.clear();

    this.container.destroy();
  }
}
