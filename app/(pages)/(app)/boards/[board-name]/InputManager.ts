import { FederatedPointerEvent } from "pixi.js";

export type PointerSample = {
  pressure: number;
  tiltX?: number;
  tiltY?: number;
};

export class InputManager<T extends (Record<string, any> | undefined)>
{
  private _state: T;

  constructor(private state?: T) 
  {
    this._state = state || (undefined as T);
  }

  pointerEventListener(callback: ({ state, event }: { state: T; event: FederatedPointerEvent }) => void) 
  {
    return (event: FederatedPointerEvent) => {
      callback({ 
        state: this._state,
        event
      });
    };
  }

  wheelEventListener(callback: ({ state, event }: { state: T; event: WheelEvent }) => void) 
  {
    return (event: WheelEvent) => {
      callback({ 
        state: this._state,
        event
      });
    };
  }

  touchEventListener(callback: ({ state, event, distance, center }: { state: T; event: TouchEvent; distance?: number; center?: { x: number; y: number } }) => void) 
  {
    return (event: TouchEvent) => {
      callback({ 
        state: this._state,
        event,
        distance: event.touches.length === 2 ? getTouchDistance(event.touches) : undefined,
        center: event.touches.length === 2 ? getTouchCenter(event.touches) : undefined,
      });
    };
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