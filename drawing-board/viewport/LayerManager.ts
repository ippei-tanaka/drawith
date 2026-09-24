import { Container, Graphics } from "pixi.js";

type LayerUpdate = {
  id: string;
  name: string;
  opacity: number;
  visible: boolean;
};

export class LayerManager extends Container 
{
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;

  constructor() {
    super();
    this.sortableChildren = true; 
  }

  update (updates: LayerUpdate[])
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
        layer.update(update);
        layer.zIndex = zIndex;
      } else {
        const newLayer = new Layer(
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
 
  getLayerById(id: string): Layer | undefined {
    return this.layers.find(layer => layer.id === id);
  }

  setActiveLayer(id: string) {
    if (this.getLayerById(id)) {
      this.activeLayerId = id;
    }
  }
}

class Layer extends Container 
{
  readonly graphics = new Graphics();

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

  update(update: LayerUpdate) 
  {
    if (this.id === update.id) {
      this.name = update.name;
      this.alpha = update.opacity;
      this.visible = update.visible;
    }
  }
}