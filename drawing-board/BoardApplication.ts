import { Application, Graphics, Renderer } from 'pixi.js';
import { BasicBrush } from './drawing/BasicBrush';
import { store } from '@/lib/store/store';
import { Grid } from './viewport/Grid';
import { Viewport } from './viewport/Viewport';
import { StrokeController } from './input/StrokeController';
import { ZoomController } from './input/ZoomController';
import { PanController } from './input/PanController';
import { LayerManager } from './viewport/LayerManager';

export class BoardApplication extends Application<Renderer> {

  private viewport = new Viewport();
  private grid = new Grid(); 
  private layerManager = new LayerManager();
  private brush = new BasicBrush({
    size: 10,
    color: 0x000000,
    opacity: 1,
  });
  private panController: PanController | null = null;
  private zoomController: ZoomController | null = null;
  private strokeController: StrokeController | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private previousStoreState: ReturnType<typeof store.getState> | null = null;

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
    this.stage.eventMode = 'static';
    this.stage.hitArea = this.screen;

    this.viewport.addChild(this.grid);
    this.viewport.addChild(this.layerManager);
    
    this.unsubscribeStore = store.subscribe(this.reflectStoreState);

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
      new Graphics(),
      this.brush
    );
    this.strokeController.init();

    this.reflectStoreState();
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

  reflectStoreState = () =>
  {
    const board = store.getState().board;
    const previousBoard = this.previousStoreState?.board;
    
    if (board.zoom !== previousBoard?.zoom) {
      const { x: screenX, y: screenY } = board.zoomPosition;
      this.viewport.zoomAt(screenX, screenY, board.zoom / 100);
    }

    if (board.tool === "pan") {
      this.panController?.activate();
    } else {
      this.panController?.deactivate();
    }

    if (board.tool === "pen") {
      this.strokeController?.activate();
    } else {
      this.strokeController?.deactivate();
    }

    if (board.color !== previousBoard?.color) {
      this.brush.setColor(board.color);
    }

    if (board.size !== previousBoard?.size) {
      // console.log("Stroke size changed to", board.size);
      this.brush.setSize(board.size);
    }

    // if (board.opacity !== previousBoard?.opacity) {
    //   this.brush.setOpacity(board.opacity);
    // }

    if (board.layers !== previousBoard?.layers) {
      // console.log("Layers changed");
      this.layerManager.update(board.layers);
    }

    if (board.activeLayerId !== previousBoard?.activeLayerId && board.activeLayerId) {
      // console.log("Active layer changed to", board.activeLayerId);
      this.strokeController?.setGraphics(this.layerManager.getLayerById(board.activeLayerId)?.graphics || new Graphics());
    }

    this.previousStoreState = store.getState();
  }
}
