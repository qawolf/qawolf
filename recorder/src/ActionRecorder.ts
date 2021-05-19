import { debug } from "./debug";
import { isVisible } from "./element";
import { EventSequence } from "./EventSequence";
import { getSelector } from "./generateSelectors";
import { resolveElementAction } from "./resolveElementAction";
import { Callback, ElementAction, RankedSelector } from "./types";

type ActionCallback = Callback<ElementAction>;

type EventListener = Callback<MouseEvent | KeyboardEvent | Event>;

export class ActionRecorder {
  _events = new EventSequence();
  _isStarted = false;
  _onDispose: Callback[] = [];
  _selectorCache = new Map<HTMLElement, RankedSelector>();

  constructor() {
    debug("ActionRecorder: created");
    this.start();
  }

  public stop(): void {
    if (!this._isStarted) return;
    this._onDispose.forEach((d) => d());
    this._onDispose = [];
    this._isStarted = false;
    debug("ActionRecorder: stopped");
  }

  listen(
    eventType: "click" | "mousedown" | "input" | "change" | "keydown",
    handler?: EventListener
  ): void {
    const listener: EventListener = handler
      ? handler
      : (e) => this.recordEvent(e);

    document.addEventListener(eventType, listener, {
      capture: true,
      passive: true,
    });

    this._onDispose.push(() =>
      document.removeEventListener(eventType, listener, {
        // `capture` value must match for proper removal
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
        capture: true,
      })
    );
  }

  recordEvent(event: MouseEvent | KeyboardEvent | Event): void {
    debug(`ActionRecorder: ${event.type} action detected`, event);

    const actionCallback: ActionCallback = (window as any).qawElementAction;
    if (!actionCallback) {
      debug("ActionRecorder: can't record actions without an action callback");
      return;
    }

    this._events.add(event);

    const elementAction = resolveElementAction(this._events);

    // If no action was returned, this isn't an event we care about
    // so we can skip building a selector and emitting it.
    if (!elementAction) return;

    // Build the selector
    if (elementAction.action !== "keyboard.press" && !elementAction.selector) {
      elementAction.selector = getSelector(
        event.target as HTMLElement,
        1000,
        this._selectorCache
      );
    }

    debug(
      `ActionRecorder: ${elementAction.action} action recorded:`,
      elementAction
    );

    actionCallback(elementAction);
  }

  public start(): void {
    if (this._isStarted) return;
    this._isStarted = true;

    //////// MOUSE EVENTS ////////

    this.listen("click", (event) => {
      // only the main button (not right clicks/etc)
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if ((event as MouseEvent).button !== 0) return;

      // Some newer components emit PointerEvent instead of older MouseEvent.
      // Usually multiple of these are emitted for the same "click". For now,
      // we will handle only "mouse" type events.
      if ((event as PointerEvent).pointerId != null && (event as PointerEvent).pointerType !== "mouse") {
        return;
      }
      
      this.recordEvent(event);
    });

    // generate a selector for a visible mousedown
    // in case the click's target becomes invisible
    // we can fallback to this selector
    this.listen("mousedown", (event) => {
      debug("ActionRecorder: mousedown detected", event);

      const target = event.target as HTMLElement;
      if (!event.isTrusted || !isVisible(target)) return;

      this._events.add(event, getSelector(target, 1000, this._selectorCache));
    });

    //////// INPUT EVENTS ////////

    this.listen("input");
    this.listen("change");

    //////// KEYBOARD EVENTS ////////

    this.listen("keydown");

    debug("ActionRecorder: started");
  }
}
