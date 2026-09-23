import { Container, FederatedPointerEvent } from "pixi.js";
import { Viewport } from "../viewport/Viewport";
import { store } from "@/lib/store/store";
import { BoardTool, setTool } from "@/lib/store/boardSlice";

export class PanController 
{
  private dragging = false;
  private originalTool = null as (BoardTool | null);

  constructor(
    private stage: Container,
    private viewport: Viewport
  ) {}

  init() 
  {
    this.stage.on("mousedown", this.mouseDown);
  }

  activate() {
    this.stage.cursor = "grab";
    this.stage.on("pointerdown", this.pointerDown);
    this.stage.on("pointermove", this.pointerMove);
    this.stage.on("pointerup", this.pointerUp);
    this.stage.on("pointercancel", this.pointerUp);
    this.stage.on("pointerupoutside", this.pointerUp);
  }

  deactivate() {
    this.stage.cursor = "default";
    this.stage.off("pointerdown", this.pointerDown);
    this.stage.off("pointermove", this.pointerMove);
    this.stage.off("pointerup", this.pointerUp);
    this.stage.off("pointercancel", this.pointerUp);
    this.stage.off("pointerupoutside", this.pointerUp);
  }

  clear() {
    this.stage.off("mousedown", this.mouseDown);
    this.stage.off("mouseup", this.mouseUp);
    this.stage.off("mouseupoutside", this.mouseUp);
    this.stage.off("pointerdown", this.pointerDown);
    this.stage.off("pointermove", this.pointerMove);
    this.stage.off("pointerup", this.pointerUp);
    this.stage.off("pointercancel", this.pointerUp);
    this.stage.off("pointerupoutside", this.pointerUp);
  };

  private mouseDown = (event: FederatedPointerEvent) => {
    if (event.button === 1) {
      this.originalTool = store.getState().board.tool;
      store.dispatch(setTool("pan"));
      this.dragging = true;
      this.stage.on("mouseup", this.mouseUp);
      this.stage.on("mouseupoutside", this.mouseUp);
    }
  };

  private mouseUp = (event: FederatedPointerEvent) => {
    if (event.button === 1) {
      this.originalTool && store.dispatch(setTool(this.originalTool));
      this.originalTool = null;
      this.stage.off("mouseup", this.mouseUp);
      this.stage.off("mouseupoutside", this.mouseUp);
    }
  };

  private pointerDown = (event: FederatedPointerEvent) => {
    this.dragging = true;
    this.stage.cursor = "grabbing";
  };

  private pointerMove = (event: FederatedPointerEvent) => {
    if (!this.dragging || store.getState().board.tool !== "pan") return;
    this.stage.cursor = "grabbing";
    this.viewport.panBy(
      event.movementX,
      event.movementY,
    );
  };

  private pointerUp = (event: FederatedPointerEvent) => {
    this.dragging = false;
    this.stage.cursor = "grab";
  };
}