import { FederatedPointerEvent, Container } from "pixi.js";

export type EventType = "pointer" | "wheel" | "touch";

type EventFor<T extends EventType> =
  T extends "pointer" ? FederatedPointerEvent :
  T extends "wheel" ? WheelEvent :
  T extends "touch" ? TouchEvent : never;

type TargetFor<T extends EventType> =
  T extends "pointer" ? Container :
  T extends "wheel" ? HTMLElement :
  T extends "touch" ? HTMLElement : never;

type ListenerRecord = {
  [T in EventType]: {
    target: TargetFor<T>;
    eventName: string;
    callback: (event: EventFor<T>) => void;
  }
}[EventType];

export class InputManager<S extends (Record<string, any> | undefined)>
{
  private _state: S;
  private record: ListenerRecord[] = [];

  constructor(private state?: S) 
  {
    this._state = state || (undefined as S);
  }

  addListener<E extends EventType> (
    target: TargetFor<E>, 
    eventName: string, 
    callback: ({ state, event }: { state: S; event: EventFor<E> }) => void
  ) {
    
    const wrappedCallback = (event: EventFor<E>) => {
      callback({ 
        state: this._state,
        event
      });
    };

    this.record.push({
      target,
      eventName,
      callback: wrappedCallback,
    } as ListenerRecord);
  }

  turnOnListener(target: TargetFor<EventType>, eventName: string) {
    for (const { target: recTarget, eventName: recEventName, callback } of this.record) {
      if (recEventName !== eventName || recTarget !== target) continue;
      if (recTarget instanceof Container) {
        recTarget.on(recEventName, callback);
      } else if (recTarget instanceof HTMLElement) {
        recTarget.addEventListener(recEventName, callback as EventListener);
      }
    }
  }

  turnOnListeners() {
    for (const { target, eventName, callback } of this.record) {
      if (target instanceof Container) {
        target.on(eventName, callback);
      } else if (target instanceof HTMLElement) {
        target.addEventListener(eventName, callback as EventListener);
      }
    }
  }

  turnOffListener(target: TargetFor<EventType>, eventName: string) {
    for (const { target: recTarget, eventName: recEventName, callback } of this.record) {
      if (recEventName !== eventName || recTarget !== target) continue;
      if (recTarget instanceof Container) {
        recTarget.off(recEventName, callback);
      } else if (recTarget instanceof HTMLElement) {
        recTarget.removeEventListener(recEventName, callback as EventListener);
      }
    }
  }

  turnOffListeners() {
    for (const { target, eventName, callback } of this.record) {
      if (target instanceof Container) {
        target.off(eventName, callback);
      } else if (target instanceof HTMLElement) {
        target.removeEventListener(eventName, callback as EventListener);
      }
    }
  }
}
