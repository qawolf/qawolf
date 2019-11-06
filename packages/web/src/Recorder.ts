import * as types from "@qawolf/types";
import { getDescriptor } from "./element";

type EventCallback = types.Callback<types.Event>;

export class Recorder {
  private _dataAttribute: string;
  private _onDispose: types.Callback[] = [];
  private _sendEvent: EventCallback;

  constructor(dataAttribute: string, sendEvent: EventCallback) {
    this._dataAttribute = dataAttribute;
    this._sendEvent = sendEvent;

    this.recordEvents();
  }

  public dispose() {
    this._onDispose.forEach(d => d());
  }

  private recordEvent<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (ev: DocumentEventMap[K]) => types.Event | undefined
  ) {
    const listener = (ev: DocumentEventMap[K]) => {
      const event = handler(ev);
      if (!event) return;

      console.log(
        `Recorder: ${eventName} event`,
        ev,
        ev.target,
        "recorded:",
        event
      );
      this._sendEvent(event);
    };

    document.addEventListener(eventName, listener, {
      capture: true,
      passive: true
    });

    this._onDispose.push(() =>
      document.removeEventListener(eventName, listener)
    );
  }

  private recordEvents() {
    this.recordEvent("click", event => ({
      isTrusted: event.isTrusted,
      name: "click",
      target: getDescriptor(event.target as HTMLElement, this._dataAttribute),
      time: Date.now()
    }));

    this.recordEvent("input", event => {
      const element = event.target as HTMLInputElement;
      // ignore input events except on selects
      if (element.tagName.toLowerCase() !== "select") return;

      return {
        isTrusted: event.isTrusted,
        name: "input",
        target: getDescriptor(element, this._dataAttribute),
        time: Date.now(),
        value: element.value
      };
    });

    this.recordEvent("keydown", event => ({
      isTrusted: event.isTrusted,
      name: "keydown",
      target: getDescriptor(event.target as HTMLElement, this._dataAttribute),
      time: Date.now(),
      value: event.code
    }));

    this.recordEvent("keyup", event => ({
      isTrusted: event.isTrusted,
      name: "keyup",
      target: getDescriptor(event.target as HTMLElement, this._dataAttribute),
      time: Date.now(),
      value: event.code
    }));

    this.recordEvent("wheel", event => {
      let element = event.target as HTMLElement;
      if (event.target === document || event.target === document.body) {
        element = (document.scrollingElement ||
          document.documentElement) as HTMLElement;
      }

      return {
        isTrusted: event.isTrusted,
        name: "scroll",
        target: getDescriptor(element, this._dataAttribute),
        time: Date.now(),
        value: {
          x: element.scrollLeft,
          y: element.scrollTop
        }
      };
    });
  }
}
