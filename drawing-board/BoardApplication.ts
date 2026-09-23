import { Application, Graphics, Renderer } from 'pixi.js';
import { BasicBrush } from './drawing/BasicBrush';
import { store } from '@/lib/store/store';
import { setTool } from '@/lib/store/boardSlice';
import { Grid } from './viewport/Grid';
import { Viewport } from './viewport/Viewport';
import { StrokeController } from './input/StrokeController';
import { ZoomController } from './input/ZoomController';
import { PanController } from './input/PanController';

export class BoardApplication extends Application<Renderer> {

  private viewport = new Viewport();
  private grid = new Grid(); 
  
  private brush = new BasicBrush({
    size: 10,
    color: 0x000000,
    opacity: 1,
  });

  private panController: PanController | null = null;
  private zoomController: ZoomController | null = null;
  private strokeController: StrokeController | null = null;

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

    this.panController = new PanController(
      this.stage,
      this.viewport
    );
    this.panController.init();

    this.zoomController = new ZoomController(
      this.canvas,
      this.viewport
    );
    this.zoomController.init();

    this.strokeController = new StrokeController(
      this.stage,
      this.viewport,
      this.graphics,
      this.brush
    );
    this.strokeController.init();

    store.dispatch(setTool("pen"));
  }

  override destroy(...params: any[]) {
    super.destroy(...params);
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.panController?.clear();
    this.zoomController?.clear();
    this.strokeController?.clear();
  }

  private onStoreStateUpdated () 
  {
    const state = store.getState();

    const { x: screenX, y: screenY } = state.board.zoomPosition;
    this.viewport.zoomAt(screenX, screenY, state.board.zoom / 100);

    if (state.board.tool === "pan") {
      this.panController?.activate();
    } else {
      this.panController?.deactivate();
    }

    if (state.board.tool === "pen") {
      this.strokeController?.activate();
    } else {
      this.strokeController?.deactivate();
    }
  }
}
