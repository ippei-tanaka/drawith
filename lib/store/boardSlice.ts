import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type BoardTool = "pen" | "eraser";

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
  strokes: Stroke[];
}

const initialState: BoardState = {
  tool: "pen",
  color: "#000000",
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

export const { setTool, setColor, addStroke, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;
