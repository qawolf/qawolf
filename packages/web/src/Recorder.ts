import * as types from "@qawolf/types";
import { getDescriptor } from "./element";

type EventCallback = (event: types.Event) => void;
type Callback = () => void;

export class Recorder {
  private _dataAttribute: string;
  private _onDispose: Callback[] = [];
  private _recordEvent: EventCallback;

  constructor(dataAttribute: string, recordEvent: EventCallback) {
    this._dataAttribute = dataAttribute;
    this._recordEvent = recordEvent;

    this.recordEvents();

    this.recordValueChanged(HTMLInputElement.prototype);
    this.recordValueChanged(HTMLSelectElement.prototype);
    this.recordValueChanged(HTMLTextAreaElement.prototype);

    // XXX do we need to intercept this?
    // this.recordValueChanged(HTMLInputElement.prototype, "checked");
  }

  public dispose() {
    this._onDispose.forEach(d => d());
  }

  private recordEvent<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (ev: DocumentEventMap[K]) => types.Event
  ) {
    const listener = (ev: DocumentEventMap[K]) => {
      const event = handler(ev);
      console.log(
        `Recorder: ${eventName} event`,
        ev,
        ev.target,
        "recorded:",
        event
      );
      this._recordEvent(event);
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
      action: "click",
      isTrusted: event.isTrusted,
      target: getDescriptor(event.target as HTMLElement, this._dataAttribute)
    }));

    const onInput = (event: Event) => {
      const element = event.target as HTMLInputElement;
      return {
        action: "input",
        isTrusted: event.isTrusted,
        target: getDescriptor(element, this._dataAttribute),
        value: element.value
      } as types.InputEvent;
    };

    this.recordEvent("change", onInput);
    this.recordEvent("input", onInput);

    this.recordEvent("scroll", event => {
      let element = event.target as HTMLElement;
      if (event.target === document) {
        element = (document.scrollingElement ||
          document.documentElement) as HTMLElement;
      }

      return {
        action: "scroll",
        isTrusted: event.isTrusted,
        target: getDescriptor(element, this._dataAttribute),
        value: {
          x: element.scrollLeft,
          y: element.scrollTop
        }
      };
    });
  }

  private recordValueChanged<T>(target: T) {
    const recorder = this;

    const valueProperty = Object.getOwnPropertyDescriptor(target, "value");

    // overwrite the property to intercept value changes
    Object.defineProperty(target, "value", {
      set(value) {
        const originalValue = this.value;
        // call original
        if (valueProperty && valueProperty.set) {
          valueProperty.set.call(this, value);
        }

        if (originalValue !== value) {
          const element = this as HTMLInputElement;

          const inputEvent: types.InputEvent = {
            action: "input",
            isTrusted: false,
            target: getDescriptor(element, recorder._dataAttribute),
            value: element.value
          };

          console.log(
            `Recorder: value change ${originalValue} -> ${value}`,
            element,
            "recorded:",
            inputEvent
          );
          recorder._recordEvent(inputEvent);
        }
      }
    });

    this._onDispose.push(() =>
      Object.defineProperty(target, "value", valueProperty || {})
    );
  }
}
