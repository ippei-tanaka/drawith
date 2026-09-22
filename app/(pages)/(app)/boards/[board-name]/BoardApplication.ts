import { Application, Container, Graphics, Renderer } from 'pixi.js';
import { store } from '@/lib/store/store';
import { setZoom, setZoomPosition } from '@/lib/store/boardSlice';

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
      this.zoom(state.board.zoom);
    });
  }

  override async init({resizeTo}:{resizeTo: HTMLElement}) 
  {
    await super.init({
      resizeTo,
      background: 0xffffff,
      antialias: true,
    });

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const stage = this.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.screen;

    stage.on("pointerdown", event => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    });

    stage.on("pointermove", event => {
      if (!dragging) return;

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      this.viewport.x += dx;
      this.viewport.y += dy;

      lastX = event.clientX;
      lastY = event.clientY;
    });
    
    stage.on("pointerup", () => {
      dragging = false;
    });

    stage.on("pointerupoutside", () => {
      dragging = false;
    });

    this.canvas.addEventListener('wheel', event => {
      event.preventDefault();
      event.stopPropagation();

      const rect = this.canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      store.dispatch(setZoomPosition({ x: screenX, y: screenY }));
      const zoom = store.getState().board.zoom;
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      store.dispatch(setZoom(zoom + delta));

    }, { passive: false });
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