import { Application, Container, Graphics, Renderer } from 'pixi.js';
import { store } from '@/lib/store/store';
import { setZoom, setZoomPosition } from '@/lib/store/boardSlice';
import { InputManager } from './InputManager';

export class BoardApplication extends Application<Renderer> {

  private viewport: Container;
  private grid: Grid;

  constructor () 
  {
    super();
    this.viewport = new Container();
    this.grid = new Grid();
    this.stage.addChild(this.viewport);
    this.viewport.addChild(this.grid);
    store.subscribe(() => {
      const state = store.getState();
      this.zoom(state.board.zoom / 100);
    });
  }

  override async init({resizeTo}:{resizeTo: HTMLElement}) 
  {
    await super.init({
      resizeTo,
      background: 0xffffff,
      antialias: true,
    });

    const stage = this.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.screen;

    const panInputManager = new InputManager({
      dragging: false
    });

    stage.on("pointerdown", panInputManager.pointerEventListener(({ state }) => {
      state.dragging = true;
    }));

    stage.on("pointermove", panInputManager.pointerEventListener(({ state, event }) => {
      if (!state.dragging) return;

      this.viewport.x += event.movementX;
      this.viewport.y += event.movementY;
    }));

    stage.on("pointerup", panInputManager.pointerEventListener(({ state }) => {
      state.dragging = false;
    }));

    stage.on("pointerupoutside", panInputManager.pointerEventListener(({ state }) => {
      state.dragging = false;
    }));

    const zoomInputManager = new InputManager({
      dragging: false,
      startDistance: 0
    });

    this.canvas.addEventListener('wheel', zoomInputManager.wheelEventListener(({ event }) => {
      event.preventDefault();
      event.stopPropagation();

      const rect = this.canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      store.dispatch(setZoomPosition({ x: screenX, y: screenY }));
      const zoom = store.getState().board.zoom;
      const delta = event.deltaY > 0 ? -10 : 10;
      store.dispatch(setZoom(zoom + delta));
    }), { passive: false });

    this.canvas.addEventListener('touchstart', zoomInputManager.touchEventListener(({ state, event, distance }) => {
      if (event.touches.length !== 2 || !distance) return;

      event.preventDefault();
      state.dragging = false;
      state.startDistance = distance;
    }), { passive: false });

    this.canvas.addEventListener('touchmove', zoomInputManager.touchEventListener(({ state, event, distance, center }) => {
      if (event.touches.length !== 2 || !distance || !center || state.startDistance <= 0) return;

      event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();

      store.dispatch(setZoomPosition({
        x: center.x - rect.left,
        y: center.y - rect.top,
      }));

      const zoom = store.getState().board.zoom;
      store.dispatch(setZoom(zoom * (distance / state.startDistance)));
      state.startDistance = distance;
    }), { passive: false });

    this.canvas.addEventListener('touchend', zoomInputManager.touchEventListener(({ state }) => {
      state.startDistance = 0;
    }));

    this.canvas.addEventListener('touchcancel', zoomInputManager.touchEventListener(({ state }) => {
      state.startDistance = 0;
    }));
  }

  private zoom (factor: number) {
    if (!Number.isFinite(factor)) return;

    const { x: screenX, y: screenY } = store.getState().board.zoomPosition;
    const before = this.viewport.toLocal({ x: screenX, y: screenY });
    this.viewport.scale.set(factor);
    const after = this.viewport.toLocal({ x: screenX, y: screenY });
    this.viewport.x += (after.x - before.x) * factor;
    this.viewport.y += (after.y - before.y) * factor;
  }
}

class Grid extends Graphics 
{
  constructor() 
  {
    super();
  
    for (let x = 0; x <= 2000; x += 100) {
      this.moveTo(x, 0);
      this.lineTo(x, 1500);
    }

    for (let y = 0; y <= 1500; y += 100) {
      this.moveTo(0, y);
      this.lineTo(2000, y);
    }

    this.stroke({
      width: 1,
      color: 0xcccccc,
    });
  }
}