import { Container, Graphics } from "pixi.js";
import type { Layer, Stroke } from "@/lib/store/boardSlice";

export class LayerRenderer 
{
  readonly container = new Container();
  private strokes = new Map<string, Graphics>();
  
  constructor(
    private parent: Container,
    private layer: Layer,
  ) {
    parent.addChild(this.container);
  }

  destroy() {
    this.container.destroy();
  }

  sync(layer: Layer) {
    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;

    this.syncStrokes(layer.strokes);
  }

  private syncStrokes(strokes: Stroke[]) {
    // add/remove/update only changed strokes
  }

}