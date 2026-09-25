import { Container, Graphics } from "pixi.js";
import { Layer, Stroke, BoardState } from "@/lib/store/boardSlice";
import { Drawer } from "../drawing/Drawer";
import { iterateSegment } from "../drawing/iterateSegment";
import { store } from "@/lib/store/store";

export class BoardRenderer 
{
  // unsubscribe?: () => void;

  constructor(
    // private target: Container
  ) {

  }

  init() {
    // this.unsubscribe = store.subscribe(() => {
    //   const state = store.getState();
    //   // Handle state updates here
    // });
  }

  clear() {
    // if (this.unsubscribe) {
    //   this.unsubscribe();
    //   this.unsubscribe = undefined;
    // }
  }

  sync(state: BoardState) {
    console.log(state);
    // Implement the logic to sync the board state with the renderer
  }
}

export const boardRenderer = new BoardRenderer();

