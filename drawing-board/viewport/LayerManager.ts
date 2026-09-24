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

    for (const update of updates) 
    {
      const layer = this.getLayerById(update.id);
      
      if (layer) {
        layer.update(update);
      } else {
        const newLayer = new Layer(
          update.id,
          update.name,
          update.opacity,
          update.visible,
        );

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

  update(update: LayerUpdate) {
    this.name = update.name;
    this.opacity = update.opacity;
    this.alpha = update.opacity;
    this.visible = update.visible;
  }
}