import * as types from "@qawolf/types";
import { buildCssSelector } from "./buildCssSelector";
import { getClickableAncestor } from "./element";
import { nodeToDocSelector } from "./serialize";

type EventCallback = types.Callback<types.ElementEvent>;

const debounce = (fn: () => void, delay: number) => {
  let inDebounce: NodeJS.Timeout;

  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce);

    inDebounce = setTimeout(() => fn.apply(context, args), delay);
  };
};

export class Recorder {
  private _attribute: string;
  private _id: number;
  private _mouseEvents: MouseEvent[] = [];
  private _onDispose: types.Callback[] = [];
  private _pageIndex: number;
  private _sendEvent: EventCallback;

  constructor(attribute: string, pageIndex: number, sendEvent: EventCallback) {
    this._attribute = attribute;
    this._id = Date.now();
    this._pageIndex = pageIndex;
    this._sendEvent = sendEvent;
    this.recordEvents();

    console.debug(`qawolf: Recorder ${this._id} created`);
  }

  public dispose() {
    this._onDispose.forEach(d => d());
    console.debug(`qawolf: Recorder ${this._id} disposed`);
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
    handler: (ev: DocumentEventMap[K]) => types.ElementEvent | void
  ) {
    this.listen(eventName, (ev: DocumentEventMap[K]) => {
      const event = handler(ev);
      if (!event) return;

      console.debug(
        `qawolf: Recorder ${this._id}: ${eventName} event`,
        ev,
        ev.target,
        "recorded:",
        event
      );
      this._sendEvent(event);
    });
  }

  private storeMouseEvent(event: MouseEvent) {
    // only the main button (not right clicks, etc.)
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    if (event.button === 0) {
      this._mouseEvents.push(event);
    }
  }

  private rankMouseEvents() {
    this._mouseEvents.sort((a, b) => a.timeStamp - b.timeStamp);
    const lastEvent = this._mouseEvents[this._mouseEvents.length - 1];

    if (
      ((lastEvent.target as HTMLElement).tagName || "").toLowerCase() ===
      "input"
    ) {
      return lastEvent;
    }

    return this._mouseEvents[0];
  }

  private sendMouseEvent = debounce(() => {
    if (!this._mouseEvents.length) return;
    const ev = this.rankMouseEvents();
    // getClickableAncestor chooses the top most clickable ancestor.
    // The ancestor is likely a better target than the descendant.
    // Ex. when you click on the i (button > i) or rect (a > svg > rect)
    // chances are the ancestor (button, a) is a better target to find.
    const target = getClickableAncestor(ev.target as HTMLElement);

    const event = {
      cssSelector: buildCssSelector({
        attribute: this._attribute,
        isClick: true,
        target
      }),
      isTrusted: ev.isTrusted,
      name: "click" as "click",
      page: this._pageIndex,
      target: nodeToDocSelector(target),
      time: Date.now()
    };

    console.debug(
      `qawolf: Recorder ${this._id}: click event`,
      ev,
      ev.target,
      "recorded:",
      event
    );

    this._sendEvent(event);
    this._mouseEvents = [];
  }, 200);

  private recordClickEvents() {
    document.addEventListener("mousedown", event => {
      this.storeMouseEvent(event);
      this.sendMouseEvent();
    });

    document.addEventListener("click", event => {
      this.storeMouseEvent(event);
      this.sendMouseEvent();
    });
  }

  private recordEvents() {
    this.recordClickEvents();

    this.recordEvent("input", event => {
      const target = event.target as HTMLInputElement;

      // ignore input events not on selects
      if (target.tagName.toLowerCase() !== "select") return;

      return {
        cssSelector: buildCssSelector({
          attribute: this._attribute,
          target
        }),
        isTrusted: event.isTrusted,
        name: "input",
        page: this._pageIndex,
        target: nodeToDocSelector(target),
        time: Date.now(),
        value: target.value
      };
    });

    this.recordEvent("keydown", event => ({
      cssSelector: buildCssSelector({
        attribute: this._attribute,
        target: event.target as HTMLElement
      }),
      isTrusted: event.isTrusted,
      name: "keydown",
      page: this._pageIndex,
      target: nodeToDocSelector(event.target as HTMLElement),
      time: Date.now(),
      value: event.key
    }));

    this.recordEvent("keyup", event => ({
      cssSelector: buildCssSelector({
        attribute: this._attribute,
        target: event.target as HTMLElement
      }),
      isTrusted: event.isTrusted,
      name: "keyup",
      page: this._pageIndex,
      target: nodeToDocSelector(event.target as HTMLElement),
      time: Date.now(),
      value: event.key
    }));

    this.recordEvent("paste", event => {
      if (!event.clipboardData) return;

      return {
        cssSelector: buildCssSelector({
          attribute: this._attribute,
          target: event.target as HTMLElement
        }),
        isTrusted: event.isTrusted,
        name: "paste",
        page: this._pageIndex,
        target: nodeToDocSelector(event.target as HTMLElement),
        time: Date.now(),
        value: event.clipboardData.getData("text")
      };
    });

    // XXX select only supports input/textarea
    // We can combine selectstart/mouseup to support content editables
    this.recordEvent("select", event => {
      const target = event.target as HTMLInputElement;
      if (
        target.selectionStart !== 0 ||
        target.selectionEnd !== target.value.length
      ) {
        // Only record select all, not other selection events
        return;
      }

      return {
        cssSelector: buildCssSelector({
          attribute: this._attribute,
          target: event.target as HTMLElement
        }),
        isTrusted: event.isTrusted,
        name: "selectall",
        page: this._pageIndex,
        target: nodeToDocSelector(event.target as HTMLElement),
        time: Date.now(),
        value: event
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
        console.debug("qawolf: ignore non-wheel scroll event", event);
        return;
      }

      let element = event.target as HTMLElement;
      if (event.target === document || event.target === document.body) {
        element = (document.scrollingElement ||
          document.documentElement) as HTMLElement;
      }

      return {
        cssSelector: buildCssSelector({
          attribute: this._attribute,
          target: event.target as HTMLElement
        }),
        isTrusted: event.isTrusted,
        name: "scroll",
        page: this._pageIndex,
        target: nodeToDocSelector(element),
        time: Date.now(),
        value: {
          x: element.scrollLeft,
          y: element.scrollTop
        }
      };
    });
  }
}
