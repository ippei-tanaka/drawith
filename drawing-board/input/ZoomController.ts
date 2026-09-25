import { setZoom } from "@/lib/store/boardSlice";
import { listenerMiddleware, type AppStore } from "@/lib/store/store";
import { Viewport } from "../viewport/Viewport";

export class ZoomController 
{
  private startDistance = 0;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private viewport: Viewport,
    private store: AppStore,
  ) {}

  init() 
  {
    this.canvas.addEventListener("wheel", this.wheel);
    this.canvas.addEventListener("touchstart", this.touchStart);
    this.canvas.addEventListener("touchmove", this.touchMove);
    this.canvas.addEventListener("touchend", this.touchEnd);
    this.canvas.addEventListener("touchcancel", this.touchCancel);
    this.unsubscribe = listenerMiddleware.startListening({
      actionCreator: setZoom,
      effect: (action) => {
        this.zoom(action.payload);
      }
    });
  }

  cleanup() {
    this.canvas.removeEventListener("wheel", this.wheel);
    this.canvas.removeEventListener("touchstart", this.touchStart);
    this.canvas.removeEventListener("touchmove", this.touchMove);
    this.canvas.removeEventListener("touchend", this.touchEnd);
    this.canvas.removeEventListener("touchcancel", this.touchCancel);
    this.unsubscribe?.();
  };

  private zoom = ({level, position}: {level: number, position: {x: number, y: number}}) => {
    const { x, y } = position;
    this.viewport.zoomAt(x, y, level / 100);
  };

  private wheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = this.canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const zoom = this.store.getState().board.zoom;
    const delta = event.deltaY > 0 ? -10 : 10;
    this.store.dispatch(setZoom({ level: zoom.level + delta, position: { x: screenX, y: screenY } }));
  };

  private touchStart = (event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    event.stopPropagation();
    this.startDistance = this.getTouchDistance(event.touches);
  };

  private touchMove = (event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    event.stopPropagation();

    const rect = this.canvas.getBoundingClientRect();
    const distance = this.getTouchDistance(event.touches);
    const center = this.getTouchCenter(event.touches);

    const zoom = this.store.getState().board.zoom;
    this.store.dispatch(setZoom({ 
      level: zoom.level * (distance / this.startDistance), 
      position: {
        x: center.x - rect.left,
        y: center.y - rect.top,
      }
    }));
    this.startDistance = distance;
  };

  private touchEnd = () => {
    this.startDistance = 0;
  };

  private touchCancel = () => {
    this.startDistance = 0;
  };

  private getTouchDistance = (touches: TouchList) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.hypot(dx, dy);
  };

  private getTouchCenter = (touches: TouchList) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };
}