import { Container, Graphics } from "pixi.js";

export class LayerManager extends Container 
{
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;

  addLayer(layer: Layer) {
    this.layers.push(layer);
    this.addChild(layer);
  }

  removeLayer(id: string) {
    const layerIndex = this.layers.findIndex(layer => layer.id === id);
    if (layerIndex !== -1) {
      const [layer] = this.layers.splice(layerIndex, 1);
      this.removeChild(layer);
      if (this.activeLayerId === id) {
        this.activeLayerId = this.layers.length > 0 ? this.layers[0].id : null;
      }
    }
  }

  getActiveLayer(): Layer | null {
    return this.layers.find(
      layer => layer.id === this.activeLayerId
    ) ?? null;
  }

  setActiveLayer(id: string) {
    this.activeLayerId = id;
  }
}

export class Layer extends Container 
{
  readonly id: string;
  readonly graphics = new Graphics();

  name: string;
  opacity = 1;
  locked = false;

  constructor(options: {id: string, name: string})
  {
    super();
    this.id = options.id;
    this.name = options.name;
    this.addChild(this.graphics);
  }
}