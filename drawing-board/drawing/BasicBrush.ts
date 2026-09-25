import { Graphics } from "pixi.js";
import { BrushSettings } from "@/lib/store/boardSlice";

export type Stroke = {
  points: PointerSample[];
};

// export type Point = {
//   x: number;
//   y: number;
// };

export type PointerSample = {
  x: number;
  y: number;
  pressure: number;
};

// type BrushSettings = {
//   size: number;
//   color: number;
//   opacity: number;
// };

export class BasicBrush 
{
  constructor(private settings: BrushSettings) 
  {}

  drawPoint(
    graphics: Graphics,
    x: number,
    y: number,
    pressure: number,
  ) {
    const radius = (this.settings.size / 2) * pressure;

    graphics.circle(x, y, radius);

    graphics.fill({
      color: this.settings.color,
      alpha: this.settings.opacity,
    });
  }

  setColor(color: number) {
    this.settings.color = color;
  }

  setSize(size: number) {
    this.settings.size = size;
  }

  setOpacity(opacity: number) {
    this.settings.opacity = opacity;
  }
}