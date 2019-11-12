import * as types from "@qawolf/types";
import { getDescriptor } from "./element";
import { findClickableAncestor } from "./find";

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

  private listen<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (ev: DocumentEventMap[K]) => any
  ) {
    document.addEventListener(eventName, handler, {
      capture: true,
      passive: true
    });

    this._onDispose.push(() =>
      document.removeEventListener(eventName, handler)
    );
  }

  private recordEvent<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (ev: DocumentEventMap[K]) => types.Event | undefined
  ) {
    this.listen(eventName, (ev: DocumentEventMap[K]) => {
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
    });
  }

  private recordEvents() {
    this.recordEvent("click", event => {
      // findClickableAncestor chooses the ancestor if it has a data-attribute
      // which is very likely the target we want to click on.
      // If there is not a data-attribute on any of the clickable ancestors
      // it will take the top most clickable ancestor.
      // The ancestor is likely a better target than the descendant.
      // Ex. when you click on the i (button > i) or rect (a > svg > rect)
      // chances are the ancestor (button, a) is a better target to find.
      // XXX if anyone runs into issues with this behavior we can allow disabling it from a flag.
      const target = findClickableAncestor(
        event.target as HTMLElement,
        this._dataAttribute
      );

      return {
        isTrusted: event.isTrusted,
        name: "click",
        target: getDescriptor(target, this._dataAttribute),
        time: Date.now()
      };
    });

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

    this.recordEvent("paste", event => {
      if (!event.clipboardData) return;

      return {
        isTrusted: event.isTrusted,
        name: "paste",
        target: getDescriptor(event.target as HTMLElement, this._dataAttribute),
        time: Date.now(),
        value: event.clipboardData.getData("text")
      };
    });

    this.recordScrollEvent();
  }

  private recordScrollEvent() {
    let lastWheelEvent: WheelEvent | null = null;
    this.listen("wheel", ev => (lastWheelEvent = ev));

    // We record the scroll event and not the wheel event
    // because it fires after the element.scrollLeft & element.scrollTop are updated
    this.recordEvent("scroll", event => {
      if (!lastWheelEvent || event.timeStamp - lastWheelEvent.timeStamp > 100) {
        // We record mouse wheel initiated scrolls only
        // to avoid recording system initiated scrolls (after selecting an item/etc).
        // This will not capture scrolls triggered by the keyboard (PgUp/PgDown/Space)
        // however we already record key events so that encompasses those.
        console.log("ignore non-wheel scroll event", event);
        return;
      }

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
