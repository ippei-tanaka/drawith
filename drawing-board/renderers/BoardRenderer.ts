import { Container, Renderer } from "pixi.js";
import {
  addLayer,
  removeLayer,
  reorderLayers,
  setLayerVisibility,
  setLayerOpacity,
  addStrokeToActiveLayer,
  eraseAtActiveLayer,
  setZoom,
  type BoardState,
  type Layer,
} from "@/lib/store/boardSlice";
import { LayerRenderer } from "./LayerRenderer";
import { AppStore, listenerMiddleware } from "@/lib/store/store";
import { isAnyOf } from "@reduxjs/toolkit";

export class BoardRenderer {
  private readonly container = new Container();
  private readonly layers = new Map<string, LayerRenderer>();
  private unsubscribe: (() => void) | null = null;

  constructor(
    private renderer: Renderer,
    private store: AppStore,
    parent: Container,
  ) {
    parent.addChild(this.container);
  }

  init() {
    this.sync(this.store.getState().board);

    this.unsubscribe = listenerMiddleware.startListening({
      matcher: isAnyOf(
        addLayer,
        removeLayer,
        reorderLayers,
        setLayerVisibility,
        setLayerOpacity,
        addStrokeToActiveLayer,
        eraseAtActiveLayer,
        // setZoom,
      ),

      effect: (_, listenerApi) => {
        this.sync(listenerApi.getState().board);
      },
    });
  }

  destroy() {
    for (const renderer of this.layers.values()) {
      renderer.destroy();
    }

    this.layers.clear();
    this.container.destroy();
    this.unsubscribe?.();
  }

  sync(state: BoardState) {
    this.syncLayers(state.layerStack.layers);
  }

  getLayerRenderer({ id }: { id: string }) {
    for (const renderer of this.layers.values()) {
      if (renderer.id === id) {
        return renderer;
      }
    }
    return null;
  }

  private syncLayers(layers: Layer[]) {
    const currentIds = new Set(layers.map((layer) => layer.id));

    // Remove deleted layers
    for (const [id, renderer] of this.layers) {
      if (!currentIds.has(id)) {
        renderer.destroy();
        this.layers.delete(id);
      }
    }

    // Add/update layers
    for (const layer of layers) {
      let renderer = this.layers.get(layer.id);

      if (!renderer) {
        renderer = new LayerRenderer(this.renderer, this.container, layer);
        this.layers.set(layer.id, renderer);
      }

      renderer.sync(layer);
    }

    // Make PIXI order match Redux order
    layers.forEach((layer, index) => {
      const renderer = this.layers.get(layer.id)!;
      this.container.setChildIndex(renderer.container, index);
    });
  }
}
