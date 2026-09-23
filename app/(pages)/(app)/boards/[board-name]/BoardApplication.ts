import { Application, Container, Graphics, Renderer } from 'pixi.js';
import { BasicBrush, Stroke } from './Brush';
import { store } from '@/lib/store/store';
import { setZoom, setZoomPosition, setTool, type BoardTool } from '@/lib/store/boardSlice';
import { InputEventManager } from './InputEventManager';

export class BoardApplication extends Application<Renderer> {

  private viewport = new Container();
  
  private grid = new Grid(); 
  
  private brush = new BasicBrush({
    size: 10,
    color: 0x000000,
    opacity: 1,
  });
  
  private strokes: Stroke[] = [];
  
  private panIEM = new InputEventManager({
    dragging: false,
    originalTool: null as (BoardTool | null)
  });

  private zoomIEM = new InputEventManager({
    dragging: false,
    startDistance: 0
  });

  private strokeIEM = new InputEventManager({
    drawing: false,
    startPoint: { x: 0, y: 0 },
    currentStroke: null as (Stroke | null)
  });

  private graphics = new Graphics();

  private unsubscribeStore: (() => void) | null = null;

  constructor () 
  {
    super();
  }

  override async init({resizeTo}:{resizeTo: HTMLElement}) 
  {
    await super.init({
      resizeTo,
      background: 0xffffff,
      antialias: true,
    });

    this.stage.addChild(this.viewport);
    this.viewport.addChild(this.grid);
    this.viewport.addChild(this.graphics);
    this.unsubscribeStore = store.subscribe(this.onStoreStateUpdated.bind(this));
    
    const stage = this.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.screen;

    this.setupPan();
    this.setupZoom();
    this.setupStroke();

    store.dispatch(setTool("pen"));
  }

  override destroy(...params: any[]) {
    super.destroy(...params);
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.panIEM.deactivateAllListeners();
    this.zoomIEM.deactivateAllListeners();
    this.strokeIEM.deactivateAllListeners();
  }

  private onStoreStateUpdated () 
  {
    const state = store.getState();
    this.zoom(state.board.zoom / 100);

    if (state.board.tool === "pan") {
      this.activatePan();
    } else {
      this.deactivatePan();
    }

    if (state.board.tool === "pen") {
      this.activateStroke();
    } else {
      this.deactivateStroke();
    }
  }

  private setupPan () 
  {
    const p = this.panIEM;
    const stage = this.stage;
    
    p.addListener("mousedown", stage, "mousedown", ({ state, event }) => {
      if (event.button === 1) {
        state.originalTool = store.getState().board.tool;
        store.dispatch(setTool("pan"));
        state.dragging = true;
        p.activateListener("mouseup");
        p.activateListener("mouseupoutside");
      }
    });

    p.addListener("mouseup", stage, "mouseup", ({ state, event }) => {
      if (event.button === 1) {
        p.deactivateListener("mouseup");
        p.deactivateListener("mouseupoutside");
        state.originalTool && store.dispatch(setTool(state.originalTool));
        state.originalTool = null;
      }
    });

    p.addListener("mouseupoutside", stage, "mouseupoutside", ({ state, event }) => {
      if (event.button === 1) {
        p.deactivateListener("mouseup");
        p.deactivateListener("mouseupoutside");
        state.originalTool && store.dispatch(setTool(state.originalTool));
        state.originalTool = null;
      }
    });

    p.activateListener("mousedown");

    p.addListener("pointerdown", stage, "pointerdown", ({ state }) => {
      state.dragging = true;
      this.stage.cursor = "grabbing";
    });

    p.addListener("pointermove", stage, "pointermove", ({ state, event }) => {
      if (!state.dragging || store.getState().board.tool !== "pan") return;
      this.stage.cursor = "grabbing";
      this.viewport.x += event.movementX;
      this.viewport.y += event.movementY;
    });

    p.addListener("pointerup", stage, "pointerup", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });

    p.addListener("pointercancel", stage, "pointercancel", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });

    p.addListener("pointerupoutside", stage, "pointerupoutside", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });
  }

  private activatePan () {
    this.stage.cursor = "grab";
    this.panIEM.activateListener("pointerdown");
    this.panIEM.activateListener("pointermove");
    this.panIEM.activateListener("pointerup");
    this.panIEM.activateListener("pointerupoutside");
  }

  private deactivatePan () {
    this.stage.cursor = "default";
    this.panIEM.deactivateListener("pointerdown");
    this.panIEM.deactivateListener("pointermove");
    this.panIEM.deactivateListener("pointerup");
    this.panIEM.deactivateListener("pointerupoutside");
  }

  private setupZoom () {

    const canvas = this.canvas;
    const z = this.zoomIEM;

    const getTouchDistance = (touches: TouchList) => {
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.hypot(dx, dy);
    };

    const getTouchCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    z.addListener("wheel", canvas, "wheel", ({ state, event }) => {
      event.preventDefault();
      event.stopPropagation();

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      store.dispatch(setZoomPosition({ x: screenX, y: screenY }));
      const zoom = store.getState().board.zoom;
      const delta = event.deltaY > 0 ? -10 : 10;
      store.dispatch(setZoom(zoom + delta));
    });
    
    z.addListener("touchstart", canvas, "touchstart", ({ state, event }) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      event.stopPropagation();
      state.dragging = false;
      state.startDistance = getTouchDistance(event.touches);
    });

    z.addListener("touchmove", canvas, "touchmove", ({ state, event }) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      event.stopPropagation();

      const rect = this.canvas.getBoundingClientRect();
      const distance = getTouchDistance(event.touches);
      const center = getTouchCenter(event.touches);

      store.dispatch(setZoomPosition({
        x: center.x - rect.left,
        y: center.y - rect.top,
      }));

      const zoom = store.getState().board.zoom;
      store.dispatch(setZoom(zoom * (distance / state.startDistance)));
      state.startDistance = distance;
    });

    z.addListener("touchend", canvas, "touchend", ({ state, event }) => {
      state.startDistance = 0;
    });

    z.addListener("touchcancel", canvas, "touchcancel", ({ state, event }) => {
      state.startDistance = 0;
    });

    z.activateAllListeners();
  }

  private zoom (factor: number) 
  {
    if (!Number.isFinite(factor)) return;

    const { x: screenX, y: screenY } = store.getState().board.zoomPosition;
    const before = this.viewport.toLocal({ x: screenX, y: screenY });
    this.viewport.scale.set(factor);
    const after = this.viewport.toLocal({ x: screenX, y: screenY });
    this.viewport.x += (after.x - before.x) * factor;
    this.viewport.y += (after.y - before.y) * factor;
  }

  private setupStroke () 
  {
    const st = this.strokeIEM;
    const stage = this.stage;

    st.addListener("pointerdown", stage, "pointerdown", ({ state, event }) => {
      if (event.button !== 0) return;

      state.drawing = true;
      const localPos = this.viewport.toLocal({ x: event.screenX, y: event.screenY });
      const point = {
        x: localPos.x,
        y: localPos.y,
        pressure: event.pressure ?? 1,
      };
      state.currentStroke = {
        points: [point]
      };
      
      this.brush.drawPoint(this.graphics, point.x, point.y, point.pressure);
      this.strokes.push(state.currentStroke);
    });

    st.addListener("pointermove", stage, "pointermove", ({ state, event }) => {
      if (!state.drawing || !state.currentStroke) return;
      const localPos = this.viewport.toLocal({ x: event.screenX, y: event.screenY });
      const point = {
        x: localPos.x,
        y: localPos.y,
        pressure: event.pressure ?? 1,
      };
      
      const lastPoint = state.currentStroke.points[state.currentStroke.points.length - 1];
      iterateSegment(lastPoint, point, 2, (x, y) => {
        this.brush.drawPoint(this.graphics, x, y, point.pressure);
      });

      state.currentStroke.points.push(point);
      this.brush.drawPoint(this.graphics, point.x, point.y, point.pressure);
    });

    st.addListener("pointerup", stage, "pointerup", ({ state, event }) => {
      if (!state.drawing || !state.currentStroke) return;
      state.drawing = false;
      state.currentStroke = null;
    });

    st.addListener("pointerupoutside", stage, "pointerupoutside", ({ state, event }) => {
      if (!state.drawing || !state.currentStroke) return;
      state.drawing = false;
      state.currentStroke = null;
    });
  }

  activateStroke ()
  {
    this.strokeIEM.activateAllListeners();
  }

  deactivateStroke ()
  {
    this.strokeIEM.deactivateAllListeners();
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

type Point = {
  x: number;
  y: number;
};


function iterateSegment(
  from: Point,
  to: Point,
  spacing: number,
  f: (x: number, y: number) => void
) 
{
  const distance = Math.hypot(
    to.x - from.x,
    to.y - from.y,
  );

  for (let d = spacing; d < distance; d += spacing) {
    const t = d / distance;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    f(x, y);
  }
}