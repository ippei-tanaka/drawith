import { Graphics } from "pixi.js";

export class Drawer 
{
  static drawPoint({
    graphics,
    x,
    y,
    pressure,
    size,
    color,
    opacity,
  }: {
    graphics: Graphics,
    x: number,
    y: number,
    pressure: number,
    size: number,
    color: number,
    opacity: number,
  }) {
    const radius = (size / 2) * pressure;

    graphics.circle(x, y, radius);

    graphics.fill({
      color: color,
      alpha: opacity,
    });
  }
}