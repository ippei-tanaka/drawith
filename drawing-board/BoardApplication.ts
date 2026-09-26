import { Application, Renderer, Container } from 'pixi.js';
import { listenerMiddleware, type AppStore } from '@/lib/store/store';
import { setActiveLayer } from '@/lib/store/boardSlice';
import { Grid } from './viewport/Grid';
import { Viewport } from './viewport/Viewport';
import { StrokeController } from './input/StrokeController';
import { ZoomController } from './input/ZoomController';
import { PanController } from './input/PanController';
import { BoardRenderer } from './renderers/BoardRenderer';

export class BoardApplication extends Application<Renderer> {

  private viewport = new Viewport();
  private grid = new Grid(); 
  private panController: PanController | null = null;
  private zoomController: ZoomController | null = null;
  private strokeController: StrokeController | null = null;
  private boardRenderer: BoardRenderer | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor (private store: AppStore) 
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
    
    this.panController = new PanController(
      this.stage,
      this.viewport,
      this.store
    );
    this.panController.init();

    this.zoomController = new ZoomController(
      this.canvas,
      this.viewport,
      this.store
    );
    this.zoomController.init();
    
    this.boardRenderer = new BoardRenderer(
      this.store,
      this.viewport
    );
    this.boardRenderer.init();

    this.strokeController = new StrokeController(
      this.stage,
      this.boardRenderer.getLayerRenderer(
        {id: this.store.getState().board.layerStack.activeLayerId || ''}
      )?.container || new Container(),
      this.viewport,
      this.store
    );
    this.strokeController.init();

    this.unsubscribe = listenerMiddleware.startListening({
      actionCreator: setActiveLayer,
      effect: (action) => {
        const id = action.payload || '';
        const container = this.boardRenderer?.getLayerRenderer({id})?.container;
        this.strokeController?.setContainer(
          container || new Container()
        );
      }
    });
  }

  override destroy(...params: any[]) {
    super.destroy(...params);
    this.panController?.cleanup();
    this.zoomController?.cleanup();
    this.strokeController?.cleanup();
    this.boardRenderer?.destroy();
    this.unsubscribe?.();
  }
}
