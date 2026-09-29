import { createSlice, type PayloadAction, nanoid } from "@reduxjs/toolkit";
import { eraseStroke } from "@/drawing-board/drawing/eraseStroke";

export enum DrawingTool {
  Pen = "pen",
  Brush = "brush",
  Eraser = "eraser",
}

export const ZOOM = {
  MIN_LEVEL: 20,
  MAX_LEVEL: 500,
};

export const BRUSH_SIZE = {
  MIN_SIZE: 1,
  MAX_SIZE: 300,
};

const DRAWING_TOOLS: DrawingTool[] = Object.values(DrawingTool);

export enum NavigationTool {
  Pan = "pan",
}

export type Tool = "pen" | "brush" | "eraser" | "pan";

export const TOOLS = {
  ...DrawingTool,
  ...NavigationTool,
};


export interface PointerSample {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: PointerSample[];
  size: number;
  color: number;
  opacity: number;
  smoothness: number;
  tool: DrawingTool;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  strokes: Stroke[];
}

export interface LayerStack {
  layers: Layer[];
  activeLayerId: string | null;
}

export interface BrushSettings {
  tool: DrawingTool;
  color: number;
  size: number;
  opacity: number;
  smoothness: number;
}

export interface Zoom {
  level: number;
  position: { x: number; y: number };
}

export interface Error {
  message: string;
}

export interface BoardState
{
  brushSettings: BrushSettings;
  tool: Tool;
  zoom: Zoom;
  layerStack: LayerStack;
  errors: Error[];
}

const defaultLayerId = nanoid();

const initialState: BoardState = {
  brushSettings: {
    tool: DrawingTool.Pen,
    color: 0x000000,
    size: 65,
    opacity: 1,
    smoothness: 2
  },
  tool: DrawingTool.Pen,
  zoom: { 
    level: 100, 
    position: { 
      x: 0, 
      y: 0 
    } 
  },
  layerStack: {
    layers: [{
      id: defaultLayerId,
      name: "Layer 1",
      visible: true,
      opacity: 1,
      strokes: [],
    }],
    activeLayerId: defaultLayerId,
  },
  errors: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: 
  {
    setTool(state, action: PayloadAction<Tool>) {
      if (DRAWING_TOOLS.includes(action.payload as DrawingTool)) {
        state.brushSettings.tool = action.payload as DrawingTool;
      }
      state.tool = action.payload;
    },
  
    setColor(state, action: PayloadAction<number>) {
      state.brushSettings.color = action.payload;
    },
  
    setSize(state, action: PayloadAction<number>) {
      state.brushSettings.size = action.payload;
    },
  
    setZoom(state, action: PayloadAction<{ level: number, position: { x: number; y: number } }>) {
      if (Number.isFinite(action.payload.level)) {
        state.zoom.level = Math.round(Math.min(ZOOM.MAX_LEVEL, Math.max(ZOOM.MIN_LEVEL, action.payload.level)));
      }
      state.zoom.position = action.payload.position;
    },

    addLayer: 
    {
      reducer(state, action: PayloadAction<Layer>) {
        const layers = state.layerStack.layers;
        action.payload.name = `Layer ${layers.length + 1}`;
        layers.push(action.payload);
        state.layerStack.activeLayerId = action.payload.id;
      },

      prepare() {
        return {
          payload: {
            id: nanoid(),
            name: "",
            strokes: [],
            visible: true,
            opacity: 1,
          },
        };
      },
    },

    setActiveLayer(state, action: PayloadAction<string>) 
    {
      state.layerStack.activeLayerId = action.payload;
    },

    renameLayer(state, action: PayloadAction<{ id: string; name: string }>)
    {
      const layer = state.layerStack.layers.find(
        layer => layer.id === action.payload.id
      );

      if (!layer) {
        state.errors.push({ message: "Layer not found." });
        return;
      }

      layer.name = action.payload.name;
    },

    setLayerVisibility(state, action: PayloadAction<{ id: string; visible: boolean }>)
    {
      const layer = state.layerStack.layers.find(
        layer => layer.id === action.payload.id
      );

      if (!layer) {
        state.errors.push({ message: "Layer not found." });
        return;
      }

      layer.visible = action.payload.visible;
    },

    setLayerOpacity(state, action: PayloadAction<{ id: string; opacity: number }>)
    {
      const layer = state.layerStack.layers.find(layer => layer.id === action.payload.id);

      if (!layer) {
        state.errors.push({ message: "Layer not found." });
        return;
      }

      if (!Number.isFinite(action.payload.opacity)) {
        state.errors.push({ message: "Invalid opacity value." });
        return;
      }

      layer.opacity = Math.min(1, Math.max(0, action.payload.opacity));
    },

    clearLayer(state, action: PayloadAction<{ id: string }>)
    {
      const layer = state.layerStack.layers.find(layer => layer.id === action.payload.id);

      if (!layer) {
        state.errors.push({ message: "Layer not found." });
        return;
      }

      layer.strokes = [];
    },

    reorderLayers(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>)
    {
      const { fromIndex, toIndex } = action.payload;
      const layers = state.layerStack.layers;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= layers.length ||
        toIndex >= layers.length ||
        fromIndex === toIndex
      ) {
        state.errors.push({ message: "Invalid layer reordering." });
        return;
      };

      const [layer] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, layer);

      console.log("Reordering layers with payload:", state.layerStack.layers);
    },

    removeLayer(state, action: PayloadAction<{id: string}>) {
      const layers = state.layerStack.layers;
      const layerIndex = layers.findIndex(layer => layer.id === action.payload.id);
      if (layerIndex === -1) {
        state.errors.push({ message: "Layer not found." });
        return;
      }
      layers.splice(layerIndex, 1);
      if (state.layerStack.activeLayerId === action.payload.id) {
        state.layerStack.activeLayerId = layers.length > 0 ? layers[0].id : null;
      }
    },

    addStrokeToActiveLayer(state, action: PayloadAction<Stroke>) 
    {
      const activeLayer = state.layerStack.layers.find(layer => layer.id === state.layerStack.activeLayerId) || null;

      if (!activeLayer) {
        state.errors.push({ message: "No active layer found." });
        return;
      }
      
      if (!activeLayer.visible) {
        state.errors.push({ message: "Active layer is not visible." });
        return;
      }

      activeLayer.strokes.push(action.payload);
    },

    eraseAtActiveLayer(state, action: PayloadAction<{
      from: PointerSample;
      to: PointerSample;
      size: number;
    }>) {
      const activeLayer = state.layerStack.layers.find(
        layer => layer.id === state.layerStack.activeLayerId,
      );

      if (!activeLayer || !activeLayer.visible) {
        return;
      }

      const strokes = activeLayer.strokes.flatMap(stroke => {
        const erased = eraseStroke(
          stroke,
          action.payload.from,
          action.payload.to,
          action.payload.size,
        );

        if (!erased) {
          return [stroke];
        }

        return erased.map((part, index) => ({
          ...part,
          id: index === 0 ? stroke.id : nanoid(),
        }));
      });

      console.log("Updated strokes for active layer:", strokes);
      activeLayer.strokes = strokes;
    },

    clearErrors(state) {
      state.errors = [];
    },
  
    clearBoard() {
      return initialState;
    },
  },
});

export const { 
  setTool,
  setColor,
  setSize,
  setZoom,
  addLayer,
  setActiveLayer,
  renameLayer,
  setLayerVisibility,
  setLayerOpacity,
  clearLayer,
  reorderLayers,
  removeLayer,
  addStrokeToActiveLayer,
  eraseAtActiveLayer,
  clearErrors,
} = boardSlice.actions;

export default boardSlice.reducer;
