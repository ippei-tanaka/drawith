import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const DRAWING_TOOLS = ["pen", "marker", "eraser"] as const;
export type DrawingTool = typeof DRAWING_TOOLS[number];
export type NavigationTool = "pan";
export type Tool = DrawingTool | NavigationTool;

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
  tool: DrawingTool;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  strokes: Stroke[];
}

export interface LayerStackState {
  layers: Layer[];
  activeLayerId: string | null;
  activeLayer: Layer | null;
}

export interface BrushSettingState {
  tool: DrawingTool;
  color: number;
  size: number;
  opacity: number;
  smoothness: number;
}

export interface ZoomState {
  level: number;
  position: { x: number; y: number };
}

export interface Error {
  message: string;
}

export interface BoardState
{
  brushSetting: BrushSettingState;
  tool: Tool;
  zoom: ZoomState;
  layerStack: LayerStackState;
  errors: Error[];
}

const defaultLayerId = crypto.randomUUID();

const initialState: BoardState = {
  brushSetting: {
    tool: "pen",
    color: 0x000000,
    size: 5,
    opacity: 1,
    smoothness: 2
  },
  tool: "pen",
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
    get activeLayer() {
      return this.layers.find(layer => layer.id === this.activeLayerId) || null;
    },
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
        state.brushSetting.tool = action.payload as DrawingTool;
      }
      state.tool = action.payload;
    },
  
    setColor(state, action: PayloadAction<number>) {
      state.brushSetting.color = action.payload;
    },
  
    setSize(state, action: PayloadAction<number>) {
      state.brushSetting.size = action.payload;
    },
  
    setZoom(state, action: PayloadAction<{ level: number, position: { x: number; y: number } }>) {
      if (Number.isFinite(action.payload.level)) {
        state.zoom.level = Math.round(Math.min(400, Math.max(10, action.payload.level)));
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
            id: crypto.randomUUID(),
            name: "",
            strokes: [],
            currentStroke: null,
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

      if (!layer.visible) {
        state.errors.push({ message: "Layer is not visible." });
        return;
      }

      if (!Number.isFinite(action.payload.opacity)) {
        state.errors.push({ message: "Invalid opacity value." });
        return;
      }

      layer.opacity = Math.min(1, Math.max(0, action.payload.opacity));
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

    addStrokeToActiveLayer: 
    {
      reducer(state, action: PayloadAction<Stroke>) 
      {
        const activeLayer = state.layerStack.activeLayer;

        if (!activeLayer) {
          state.errors.push({ message: "No active layer found." });
          return;
        }
        
        if (!activeLayer.visible) {
          state.errors.push({ message: "Active layer is not visible." });
          return;
        }

        // console.log("Adding stroke to active layer:", action.payload);

        activeLayer.strokes.push(action.payload);
      },

      prepare(stroke: Omit<Stroke, "id">) {
        return { payload: { id: crypto.randomUUID(), ...stroke } };
      }
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
  reorderLayers,
  removeLayer,
  addStrokeToActiveLayer,
  clearErrors,
} = boardSlice.actions;

export default boardSlice.reducer;
