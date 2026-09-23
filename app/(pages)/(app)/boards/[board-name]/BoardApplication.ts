import { Application, Container, Graphics, Renderer } from 'pixi.js';
import { BasicBrush, Stroke } from './Brush';
import { store } from '@/lib/store/store';
import { setZoom, setZoomPosition, setTool, type BoardTool } from '@/lib/store/boardSlice';
import { InputManager } from './InputManager';

export class BoardApplication extends Application<Renderer> {

  private viewport = new Container();
  
  private grid = new Grid(); 
  
  private brush = new BasicBrush({
    size: 10,
    color: 0x000000,
    opacity: 1,
  });
  
  private strokes: Stroke[] = [];
  
  private panInputManager = new InputManager({
    dragging: false,
    originalTool: null as (BoardTool | null)
  });

  private zoomInputManager = new InputManager({
    dragging: false,
    startDistance: 0
  });

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
    this.unsubscribeStore = store.subscribe(this.onStoreStateUpdated.bind(this));

    const stage = this.stage;
    stage.eventMode = 'static';
    stage.hitArea = this.screen;

    this.setupPanInputManager();
    this.setupZoomInputManager();
    // this.setupStrokeEventListeners();
  }

  override destroy(...params: any[]) {
    super.destroy(...params);
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.panInputManager.deactivateAllListeners();
    this.zoomInputManager.deactivateAllListeners();
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

  private setupPanInputManager () 
  {
    const pIM = this.panInputManager;
    const stage = this.stage;
    
    pIM.addListener("mousedown", stage, "mousedown", ({ state, event }) => {
      if (event.button === 1) {
        state.originalTool = store.getState().board.tool;
        store.dispatch(setTool("pan"));
        state.dragging = true;
        pIM.activateListener("mouseup");
        pIM.activateListener("mouseupoutside");
      }
    });

    pIM.addListener("mouseup", stage, "mouseup", ({ state, event }) => {
      if (event.button === 1) {
        pIM.deactivateListener("mouseup");
        pIM.deactivateListener("mouseupoutside");
        state.originalTool && store.dispatch(setTool(state.originalTool));
        state.originalTool = null;
      }
    });

    pIM.addListener("mouseupoutside", stage, "mouseupoutside", ({ state, event }) => {
      if (event.button === 1) {
        pIM.deactivateListener("mouseup");
        pIM.deactivateListener("mouseupoutside");
        state.originalTool && store.dispatch(setTool(state.originalTool));
        state.originalTool = null;
      }
    });

    pIM.activateListener("mousedown");

    pIM.addListener("pointerdown", stage, "pointerdown", ({ state }) => {
      state.dragging = true;
      this.stage.cursor = "grabbing";
    });

    pIM.addListener("pointermove", stage, "pointermove", ({ state, event }) => {
      if (!state.dragging || store.getState().board.tool !== "pan") return;
      this.stage.cursor = "grabbing";
      this.viewport.x += event.movementX;
      this.viewport.y += event.movementY;
    });

    pIM.addListener("pointerup", stage, "pointerup", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });

    pIM.addListener("pointercancel", stage, "pointercancel", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });

    pIM.addListener("pointerupoutside", stage, "pointerupoutside", ({ state }) => {
      state.dragging = false;
      this.stage.cursor = "grab";
    });
  }

  private activatePan () {
    this.stage.cursor = "grab";
    this.panInputManager.activateListener("pointerdown");
    this.panInputManager.activateListener("pointermove");
    this.panInputManager.activateListener("pointerup");
    this.panInputManager.activateListener("pointerupoutside");
  }

  private deactivatePan () {
    this.stage.cursor = "default";
    this.panInputManager.deactivateListener("pointerdown");
    this.panInputManager.deactivateListener("pointermove");
    this.panInputManager.deactivateListener("pointerup");
    this.panInputManager.deactivateListener("pointerupoutside");
  }

  private setupZoomInputManager () {

    const canvas = this.canvas;
    const zIM = this.zoomInputManager;

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

    zIM.addListener("wheel", canvas, "wheel", ({ state, event }) => {
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
    
    zIM.addListener("touchstart", canvas, "touchstart", ({ state, event }) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      event.stopPropagation();
      state.dragging = false;
      state.startDistance = getTouchDistance(event.touches);
    });

    zIM.addListener("touchmove", canvas, "touchmove", ({ state, event }) => {
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

    zIM.addListener("touchend", canvas, "touchend", ({ state, event }) => {
      state.startDistance = 0;
    });

    zIM.addListener("touchcancel", canvas, "touchcancel", ({ state, event }) => {
      state.startDistance = 0;
    });

    zIM.activateAllListeners();
  }

  /*
  setupStrokeEventListeners () 
  {
    const strokeInputManager = new InputManager({
      dragging: false,
      currentStroke: null as Stroke | null,
    });

    const stage = this.stage;

    stage.on("pointerdown", strokeInputManager.OnPointer("s1", ({ state, event }) => {
      if (event.button !== 0) return;

      state.dragging = true;
      const localPos = this.viewport.toLocal({ x: event.clientX, y: event.clientY });
      state.currentStroke = {
        points: [{
          x: localPos.x,
          y: localPos.y,
          pressure: event.pressure ?? 1,
        }]
      };
      this.strokes.push(state.currentStroke);
    }));

    stage.on("pointermove", strokeInputManager.OnPointer("s2", ({ state, event }) => {
      if (!state.dragging || !state.currentStroke) return;
      const localPos = this.viewport.toLocal({ x: event.clientX, y: event.clientY });
      state.currentStroke.points.push({
        x: localPos.x,
        y: localPos.y,
        pressure: event.pressure ?? 1,
      });
    }));

    stage.on("pointerup", strokeInputManager.OnPointer("s3", ({ state }) => {
      state.dragging = false;
      state.currentStroke = null;
    }));

    stage.on("pointerupoutside", strokeInputManager.OnPointer("s4", ({ state }) => {
      state.dragging = false;
      state.currentStroke = null;
    }));
  }
    */
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