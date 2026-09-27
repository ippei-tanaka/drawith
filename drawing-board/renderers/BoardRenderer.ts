import { Container } from "pixi.js";
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
  private readonly layerRenderers = new Map<string, LayerRenderer>();
  private unsubscribe: (() => void) | null = null;

  constructor(
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
      ),

      effect: (_, listenerApi) => {
        this.sync(listenerApi.getState().board);
      },
    });
  }

  destroy() {
    for (const renderer of this.layerRenderers.values()) {
      renderer.destroy();
    }

    this.layerRenderers.clear();
    this.container.destroy();
    this.unsubscribe?.();
  }

  sync(state: BoardState) {
    this.syncLayers(state.layerStack.layers);
  }

  getActiveLayerRenderer() {
    const activeLayerId = this.store.getState().board.layerStack.activeLayerId;
    return this.layerRenderers.get(activeLayerId || "") ?? null;
  }

  private syncLayers(layers: Layer[]) {
    const currentIds = new Set(layers.map((layer) => layer.id));

    // Remove deleted layers
    for (const [id, renderer] of this.layerRenderers) {
      if (!currentIds.has(id)) {
        renderer.destroy();
        this.layerRenderers.delete(id);
      }
    }

    // Add/update layers
    for (const layer of layers) {
      let renderer = this.layerRenderers.get(layer.id);

      if (!renderer) {
        renderer = new LayerRenderer(layer);
        this.container.addChild(renderer.container);
        this.layerRenderers.set(layer.id, renderer);
      }

      renderer.sync(layer);
    }

    // Make PIXI order match Redux order
    layers.forEach((layer, index) => {
      const renderer = this.layerRenderers.get(layer.id)!;
      this.container.setChildIndex(renderer.container, index);
    });
  }
}
