import { debug } from "./debug";
import { getInputElementValue } from "./element";
import { getSelector } from "./generateSelectors";
import { resolveAction } from "./resolveAction";
import { Action, Callback, ElementAction, PossibleAction } from "./types";

type ActionCallback = Callback<ElementAction>;

export class ActionRecorder {
  _lastReceivedAction: PossibleAction;
  _onDispose: Callback[] = [];
  _selectorCache = new Map<HTMLElement, string>();

  constructor() {
    debug("ActionRecorder: created");
    this.start();
  }

  public stop(): void {
    this._onDispose.forEach((d) => d());
    debug("ActionRecorder: stopped");
  }

  listen(
    eventName: "click" | "input" | "change" | "keydown",
    handler: (ev: MouseEvent | KeyboardEvent | Event) => any
  ): void {
    document.addEventListener(eventName, handler, {
      capture: true,
      passive: true,
    });

    this._onDispose.push(() =>
      document.removeEventListener(eventName, handler, {
        // `capture` value must match for proper removal
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
        capture: true,
      })
    );
  }

  recordAction(
    action: Action,
    event: MouseEvent | KeyboardEvent | Event,
    value?: string
  ): void {
    debug(`ActionRecorder: ${action} action detected`, event);

    const actionCallback: ActionCallback = (window as any).qawElementAction;
    if (!actionCallback) {
      debug("ActionRecorder: can't record actions without an action callback");
      return;
    }

    const time = Date.now();

    // This is mainly to make resolveAction easier to test.
    // We then don't need to mock complicated browser Event object.
    const possibleAction: PossibleAction = {
      action,
      isTrusted: event.isTrusted,
      target: event.target as HTMLElement,
      time,
      value,
    };

    action = resolveAction(possibleAction, this._lastReceivedAction);

    this._lastReceivedAction = possibleAction;

    // If no action was returned, this isn't an event we care about
    // so we can skip building a selector and emitting it.
    if (!action) return;

    let selector = "";

    if (action !== "keyboard.press") {
      selector = getSelector(
        event.target as HTMLElement,
        1000,
        this._selectorCache
      );
    }

    const elementAction: ElementAction = {
      action,
      selector,
      time,
    };

    if (value !== undefined) {
      // Value should be coerced to an empty string
      elementAction.value = typeof value === "string" ? value : "";
    }

    debug(`ActionRecorder: ${action} action recorded:`, elementAction);

    actionCallback(elementAction);
  }

  public start(): void {
    //////// MOUSE EVENTS ////////

    this.listen("click", (event) => {
      // only the main button (not right clicks/etc)
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if ((event as MouseEvent).button !== 0) return;

      this.recordAction("click", event);
    });

    //////// INPUT EVENTS ////////

    this.listen("input", (event) => {
      const target = event.target as HTMLInputElement;
      this.recordAction("fill", event, getInputElementValue(target));
    });

    this.listen("change", (event) => {
      const target = event.target as HTMLInputElement;
      this.recordAction("fill", event, getInputElementValue(target));
    });

    //////// KEYBOARD EVENTS ////////

    this.listen("keydown", (event) => {
      this.recordAction("press", event, (event as KeyboardEvent).key);
    });

    debug("ActionRecorder: started");
  }
}
