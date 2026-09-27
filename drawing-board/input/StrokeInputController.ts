import { Container, FederatedPointerEvent } from "pixi.js";
import { type PointerSample } from "@/lib/store/boardSlice";
import { Viewport } from "../viewport/Viewport";

export class StrokeInputController {
  private drawing = false;
  private _onStart: (point: PointerSample) => void = () => {};
  private _onMove: (point: PointerSample) => void = () => {};
  private _onEnd: (point: PointerSample) => void = () => {};

  constructor(
    private surface: Container,
  ) {}

  init() {
    this.activate();
  }

  activate() {
    this.surface.on("pointerdown", this.pointerDown);
    this.surface.on("pointermove", this.pointerMove);
    this.surface.on("pointerup", this.pointerUp);
    this.surface.on("pointerupoutside", this.pointerUp);
  }

  deactivate() {
    this.surface.off("pointerdown", this.pointerDown);
    this.surface.off("pointermove", this.pointerMove);
    this.surface.off("pointerup", this.pointerUp);
    this.surface.off("pointerupoutside", this.pointerUp);
    this.drawing = false;
  }

  cleanup() {
    this.deactivate();
  }

  set onStart(callback: (point: PointerSample) => void) {
    this._onStart = callback;
  }

  set onMove(callback: (point: PointerSample) => void) {
    this._onMove = callback;
  }

  set onEnd(callback: (point: PointerSample) => void) {
    this._onEnd = callback;
  }

  private pointerDown = (event: FederatedPointerEvent) => {
    this.drawing = true;
    this._onStart(this.samplePoint(event));
  };

  private pointerMove = (event: FederatedPointerEvent) => {
    if (!this.drawing) {
      return;
    }
    this._onMove(this.samplePoint(event));
  };

  private pointerUp = (event: FederatedPointerEvent) => {
    if (!this.drawing) {
      return;
    }
    this._onEnd(this.samplePoint(event));
    this.drawing = false;
  };

  private samplePoint(event: FederatedPointerEvent) {
    return {
      x: event.global.x,
      y: event.global.y,
      pressure: event.pressure,
    };
  }
}
