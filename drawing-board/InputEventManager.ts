import { FederatedPointerEvent, Container } from "pixi.js";

export type EventType = "pointer" | "wheel" | "touch";

type EventNameFor<T extends EventType> = {
  pointer: "pointerdown" | "pointermove" | "pointerup" | "pointerupoutside" | "pointercancel" | "mousedown" | "mouseup" | "mouseupoutside" | "mousemove" | "mouseenter" | "mouseleave" | "mouseover" | "mouseout";
  wheel: "wheel";
  touch: "touchstart" | "touchmove" | "touchend" | "touchcancel";
}[T];

type EventName = EventNameFor<EventType>;

type EventForType<T extends EventType> =
  T extends "pointer" ? FederatedPointerEvent :
  T extends "wheel" ? WheelEvent :
  T extends "touch" ? TouchEvent : never;

type EventTypeForName<T extends EventName> = {
  [E in EventType]: T extends EventNameFor<E> ? E : never;
}[EventType];

type EventFor<T extends EventName> = EventForType<EventTypeForName<T>>;

type TargetForType<T extends EventType> =
  T extends "pointer" ? Container : HTMLElement;

type TargetFor<T extends EventName> = TargetForType<EventTypeForName<T>>;

type MetaFor<E extends EventName> = {
  pointer: {};
  wheel: {};
  touch: {
    distance: number;
    center: { x: number; y: number };
  };
}[EventTypeForName<E>];

type ListenerRecord = {
  [T in EventType]: {
    target: TargetForType<T>;
    eventName: EventNameFor<T>;
    callback: (event: EventForType<T>) => void;
    isOn: boolean;
  }
}[EventType];

export class InputEventManager<S extends (Record<string, any> | undefined)>
{
  private _state: S;
  private record: Record<string, ListenerRecord> = {};

  constructor(private __state?: S) 
  {
    this._state = __state || (undefined as S);
  }

  addListener<E extends EventName> (
    listenerName: string,
    target: TargetFor<E>, 
    eventName: E, 
    callback: ({ state, event, meta }: 
      { state: S; event: EventFor<E>; meta?: MetaFor<E> }) => void
  ) {
    
    const wrappedCallback = (event: EventFor<E>) => {
      // console.log(listenerName);
      callback({ 
        state: this._state,
        event,
        meta: event instanceof TouchEvent && event.touches.length >= 2 ? {
          distance: getTouchDistance(event.touches),
          center: getTouchCenter(event.touches)
        } : undefined
      });
    };

    this.record[listenerName] = {
      target,
      eventName,
      callback: wrappedCallback,
      isOn: false,
    } as ListenerRecord;
  }

  activateListener(listenerName: string) {
    const record = this.record[listenerName];
    if (!record) return;
    const { target, eventName, callback, isOn } = record;
    if (target instanceof Container && !isOn) {
      target.on(eventName, callback as (...args: any[]) => void);
      record.isOn = true;
    } else if (target instanceof HTMLElement && !isOn) {
      target.addEventListener(eventName, callback as EventListener);
      record.isOn = true;
    }
  }

  activateAllListeners() {
    for (const record of Object.values(this.record)) {
      const { target, eventName, callback, isOn } = record;
      if (target instanceof Container && !isOn) {
        target.on(eventName, callback as (...args: any[]) => void);
        record.isOn = true;
      } else if (target instanceof HTMLElement && !isOn) {
        target.addEventListener(eventName, callback as EventListener);
        record.isOn = true;
      }
    }
  }

  deactivateListener(listenerName: string) {
    const record = this.record[listenerName];
    if (!record) return;
    const { target, eventName, callback, isOn } = record;
    if (target instanceof Container && isOn) {
      target.off(eventName, callback as (...args: any[]) => void);
      record.isOn = false;
    } else if (target instanceof HTMLElement && isOn) {
      target.removeEventListener(eventName, callback as EventListener);
      record.isOn = false;
    }
  }

  deactivateAllListeners() {
    for (let record of Object.values(this.record)) {
      const { target, eventName, callback, isOn } = record;
      if (target instanceof Container && isOn) {
        target.off(eventName, callback as (...args: any[]) => void);
        record.isOn = false;
      } else if (target instanceof HTMLElement && isOn) {
        target.removeEventListener(eventName, callback as EventListener);
        record.isOn = false;
      }
    }
  }
}


const getTouchDistance = (touches: TouchList) => {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.hypot(dx, dy);
};

const getTouchCenter = (touches: TouchList) => {
  let x = 0;
  let y = 0;

  for (let index = 0; index < touches.length; index++) {
    x += touches[index].clientX;
    y += touches[index].clientY;
  }

  return {
    x: x / touches.length,
    y: y / touches.length,
  };
};