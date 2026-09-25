import { Container, Graphics } from "pixi.js";
import { Layer, Stroke } from "@/lib/store/boardSlice";
import { Drawer } from "../drawing/Drawer";
import { iterateSegment } from "../drawing/iterateSegment";

export class LayerManager extends Container 
{
  private layers: LayerView[] = [];

  constructor() {
    super();
    this.sortableChildren = true; 
  }

  update (updates: Layer[])
  {
    const updatesById = new Map(updates.map(update => [update.id, update]));

    for (let index = this.layers.length - 1; index >= 0; index--)
    {
      const layer = this.layers[index];
      if (!updatesById.has(layer.id)) {
        this.removeChild(layer);
        this.layers.splice(index, 1);
      }
    }

    for (let i = 0; i < updates.length; i++)
    {
      const update = updates[i];
      const layer = this.getLayerById(update.id);
      const zIndex = updates.length - i;

      if (layer) {
        layer.updateLayerInfo(update);
        layer.zIndex = zIndex;
      } else {
        const newLayer = new LayerView(
          update.id,
          update.name,
          update.opacity,
          update.visible,
        );
        newLayer.zIndex = zIndex;

        this.layers.push(newLayer);
        this.addChild(newLayer);
      }
    }
  }
 
  getLayerById(id: string): LayerView | undefined {
    return this.layers.find(layer => layer.id === id);
  }
}

class LayerView extends Container 
{
  readonly graphics = new Graphics();
  // private previousStrokes: Stroke[] = [];

  constructor(
    public id: string, 
    public name: string, 
    private opacity: number, 
    private _visible: boolean)
  {
    super();
    this.addChild(this.graphics);
    this.visible = this._visible;
    this.alpha = this.opacity;
  }

  updateLayerInfo(update: Layer) 
  {
    if (this.id === update.id) {
      this.name = update.name;
      this.alpha = update.opacity;
      this.visible = update.visible;
    }

    // this.previousStrokes = update.strokes;
  }

  updateStrokes(strokes: Stroke[]) 
  {
    this.graphics.clear();

    for (const stroke of strokes) 
    {
      if (stroke.points.length === 0) continue;

      // Draw the first point of the stroke
      Drawer.drawPoint({
        graphics: this.graphics,
        x: stroke.points[0].x,
        y: stroke.points[0].y,
        pressure: stroke.points[0].pressure,
        size: stroke.size,
        color: stroke.color,
        opacity: stroke.opacity,
      });

      if (stroke.points.length < 2) continue;
      
      for (let i = 1; i < stroke.points.length; i++) 
      {
        const lastPoint = stroke.points[i - 1];
        const point = stroke.points[i];

        iterateSegment(
          lastPoint,
          point,
          stroke.smoothness,
          (x, y) => {
            Drawer.drawPoint({
              graphics: this.graphics,
              x: x,
              y: y,
              pressure: point.pressure,
              size: stroke.size,
              color: stroke.color,
              opacity: stroke.opacity,
            });
          },
        );

      }
    }
  }
}