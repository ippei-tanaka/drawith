import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type BoardTool = "pen" | "marker" | "eraser" | "pan";

/*
export interface Point
{
  x: number;
  y: number;
}

export interface Stroke
{
  id: string;
  color: number;
  points: Point[];
}
  */

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  // strokes: Stroke[];
}

interface BoardState
{
  tool: BoardTool;
  color: number;
  size: number;
  zoom: number;
  zoomPosition: { x: number; y: number };
  layers: Layer[];
  activeLayerId: string | null;
}

const defaultLayerId = nanoid();

const initialState: BoardState = {
  tool: "pen",
  color: 0x000000,
  size: 5,
  zoom: 100,
  zoomPosition: { x: 0, y: 0 },
  layers: [{
    id: defaultLayerId,
    name: "Layer 1",
    visible: true,
    opacity: 1,
    // strokes: [],
  }],
  activeLayerId: defaultLayerId,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: 
  {
    setTool(state, action: PayloadAction<BoardTool>) {
      state.tool = action.payload;
    },
  
    setColor(state, action: PayloadAction<number>) {
      state.color = action.payload;
    },
  
    setSize(state, action: PayloadAction<number>) {
      state.size = action.payload;
    },
  
    setZoom(state, action: PayloadAction<number>) {
      if (Number.isFinite(action.payload)) {
        state.zoom = Math.round(Math.min(400, Math.max(10, action.payload)));
      }
    },
  
    setZoomPosition(state, action: PayloadAction<{ x: number; y: number }>) {
      state.zoomPosition = action.payload;
    },

    addLayer: 
    {
      reducer(state, action: PayloadAction<Layer>) {
        state.layers.push(action.payload);
        state.activeLayerId = action.payload.id;
      },

      prepare(name: string) {
        return {
          payload: {
            id: nanoid(),
            name,
            // strokes: [],
            visible: true,
            opacity: 1,
          },
        };
      },
    },

    setActiveLayer(state, action: PayloadAction<string>) 
    {
      state.activeLayerId = action.payload;
    },

    renameLayer(state, action: PayloadAction<{ id: string; name: string }>)
    {
      const layer = state.layers.find(
        layer => layer.id === action.payload.id
      );

      if (layer) {
        layer.name = action.payload.name;
      }
    },

    setLayerVisibility(state, action: PayloadAction<{ id: string; visible: boolean }>)
    {
      const layer = state.layers.find(
        layer => layer.id === action.payload.id
      );

      if (layer) {
        layer.visible = action.payload.visible;
      }
    },

    setLayerOpacity(state, action: PayloadAction<{ id: string; opacity: number }>)
    {
      const layer = state.layers.find(
        layer => layer.id === action.payload.id
      );

      if (layer && Number.isFinite(action.payload.opacity)) {
        layer.opacity = Math.min(1, Math.max(0, action.payload.opacity));
      }
    },

    reorderLayers(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>)
    {
      const { fromIndex, toIndex } = action.payload;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.layers.length ||
        toIndex >= state.layers.length ||
        fromIndex === toIndex
      ) return;

      const [layer] = state.layers.splice(fromIndex, 1);
      state.layers.splice(toIndex, 0, layer);
    },

    removeLayer(state, action: PayloadAction<string>) {
      const layerIndex = state.layers.findIndex(layer => layer.id === action.payload);
      if (layerIndex !== -1) {
        state.layers.splice(layerIndex, 1);
        if (state.activeLayerId === action.payload) {
          state.activeLayerId = state.layers.length > 0 ? state.layers[0].id : null;
        }
      }
    },


      /*
    addStroke: 
    {
      reducer(state, action: PayloadAction<Stroke>) {
        state.strokes.push(action.payload);
      },

      prepare(points: Point[], color: string) {
        return { payload: { id: nanoid(), points, color } };
      },
    },
  
    clearBoard(state) {
      state.strokes = [];
    },
    */
  },
});

export const { 
  setTool,
  setColor,
  setSize,
  setZoom,
  setZoomPosition,
  addLayer,
  setActiveLayer,
  renameLayer,
  setLayerVisibility,
  setLayerOpacity,
  reorderLayers,
  removeLayer
} = boardSlice.actions;

export default boardSlice.reducer;
