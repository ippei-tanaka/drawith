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
      const delta = event.deltaY > 0 ? -10 : 10;
      store.dispatch(setZoom(zoom + delta));
    }, { passive: false });


    let startDistance = 0;
    
    this.canvas.addEventListener('touchstart', event => {
      if (event.touches.length === 2) {
        event.preventDefault(); // Stop default scrolling/zooming
        dragging = false;
        startDistance = getTouchDistance(event.touches);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', event => {
      if (event.touches.length !== 2 || startDistance <= 0) return;

      event.preventDefault();
      
      const currentDistance = getTouchDistance(event.touches);
      const zoomRatio = currentDistance / startDistance;
      const center = getTouchCenter(event.touches);
      const rect = this.canvas.getBoundingClientRect();

      store.dispatch(setZoomPosition({
        x: center.x - rect.left,
        y: center.y - rect.top,
      }));

      const zoom = store.getState().board.zoom;
      store.dispatch(setZoom(zoom * zoomRatio));

      // Update start distance for the next move tick
      startDistance = currentDistance;
    }, { passive: false });

    const resetPinch = () => {
      startDistance = 0;
    };

    this.canvas.addEventListener('touchend', resetPinch);
    this.canvas.addEventListener('touchcancel', resetPinch);
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

function getTouchDistance(touches: TouchList) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.hypot(dx, dy);
}

function getTouchCenter(touches: TouchList) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}