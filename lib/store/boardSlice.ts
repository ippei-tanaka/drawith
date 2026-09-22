import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type BoardTool = "pen" | "marker" | "eraser";

export interface Point
{
  x: number;
  y: number;
}

export interface Stroke
{
  id: string;
  color: string;
  points: Point[];
}

interface BoardState
{
  tool: BoardTool;
  color: string;
  size: number;
  zoom: number;
  zoomPosition: { x: number; y: number };
  strokes: Stroke[];
}

const initialState: BoardState = {
  tool: "pen",
  color: "#000000",
  size: 5,
  zoom: 1,
  zoomPosition: { x: 0, y: 0 },
  strokes: [],
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setTool(state, action: PayloadAction<BoardTool>) {
      state.tool = action.payload;
    },
    setColor(state, action: PayloadAction<string>) {
      state.color = action.payload;
    },
    setSize(state, action: PayloadAction<number>) {
      state.size = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      if (Number.isFinite(action.payload)) {
        state.zoom = Math.min(4, Math.max(0.1, action.payload));
      }
    },
    setZoomPosition(state, action: PayloadAction<{ x: number; y: number }>) {
      state.zoomPosition = action.payload;
    },
    addStroke: {
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
  },
});

export const { 
  setTool,
  setColor,
  setSize,
  setZoom,
  setZoomPosition,
  addStroke,
  clearBoard
} = boardSlice.actions;

export default boardSlice.reducer;
