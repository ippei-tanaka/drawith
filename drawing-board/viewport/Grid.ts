import { Graphics } from "pixi.js";

export class Grid extends Graphics 
{
  constructor() 
  {
    super();
  
    for (let x = 0; x <= 2000; x += 100) {
      this.moveTo(x, 0);
      this.lineTo(x, 1500);
    }

    for (let y = 0; y <= 1500; y += 100) {
      this.moveTo(0, y);
      this.lineTo(2000, y);
    }

    this.stroke({
      width: 1,
      color: 0xcccccc,
    });
  }
}