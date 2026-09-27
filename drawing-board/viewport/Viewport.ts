import { Container } from "pixi.js";

export class Viewport extends Container 
{
  zoomAt(
    screenX: number,
    screenY: number,
    factor: number,
  ) {
    if (!Number.isFinite(factor)) return;

    const before = this.toLocal({
      x: screenX,
      y: screenY,
    });

    this.scale.set(factor);

    const after = this.toLocal({
      x: screenX,
      y: screenY,
    });

    this.x += (after.x - before.x) * factor;
    this.y += (after.y - before.y) * factor;
  }

  panBy (x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  documentPoint (screenX: number, screenY: number) {
    return this.toLocal({
      x: screenX,
      y: screenY,
    });
  }
}