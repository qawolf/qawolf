import { debug } from "./debug";
import {
  ElementDescriptor,
  getDescriptor,
  getTopmostEditableElement,
  isVisible,
} from "./element";
import { getSelector } from "./generateSelectors";
import { EventSequence } from "./EventSequence";
import { Action, ElementAction, EventDescriptor, RankedSelector, Rect } from "./types";

/**
 * The full list:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
const KEYS_TO_TRACK_FOR_CONTENTEDITABLE = new Set([
  // Enter types a line break, shouldn't be a press.
  "Escape",
  // NOTE: Sometimes tab types a tab character, but this seems to be
  // only with libraries like Quill that must intercept the keydown.
  // It seems difficult to detect when this is happening, so for now
  // an extra Tab press may be built and would need to be manually
  // deleted from the generated test.
  "Tab",
]);

const KEYS_TO_TRACK_FOR_INPUT = new Set(["Enter", "Escape", "Tab"]);

const KEYS_TO_TRACK_FOR_TEXTAREA = new Set([
  // Enter types a line break, shouldn't be a press.
  "Escape",
  "Tab",
]);

/**
 * These are key presses that we want to include when playing back as long as they
 * aren't being pressed as part of editing some input text.
 */
export const KEYS_TO_TRACK_FOR_NON_INPUT = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Backspace",
  "Delete",
  "End",
  "Enter",
  "Escape",
  "Home",
  "PageDown",
  "PageUp",
  "Tab",
]);

export const resolveAction = (
  type: string,
  targetDescriptor: ElementDescriptor
): Action | undefined => {
  let action: Action;

  if (type === "change" || type === "input") {
    if (targetDescriptor.tag === "select") {
      action = "selectOption";
    } else if (['checkbox', 'radio'].includes(targetDescriptor.inputType)) {
      action = targetDescriptor.inputIsChecked === true ? "check" : "uncheck";
    } else {
      action = "fill";
    }
  } else if (type === "click") {
    action = "click";
  } else if (type === "keydown") {
    action = "press";
  }

  if (targetDescriptor.tag === "select" && action !== "selectOption") {
    debug(`resolveAction: skip ${action} on select`);
    action = undefined;
  }

  return action;
};

export const resolveElementAction = (
  events: EventSequence,
  selectorCache: Map<HTMLElement, RankedSelector>
): ElementAction | undefined => {
  const event = events.last;
  if (!event.isTrusted && !allowUntrustedEvents) {
    debug("resolveAction: skip untrusted action");
    return;
  }

  if (events.isDuplicateChangeOrInput() || events.isDuplicateClick()) {
    debug(`resolveAction: skip duplicate ${event.type}`);
    return;
  }

  // This should stay here to keep this fast. Put checks that don't rely on
  // target before this, and checks that do after this.
  const target = getTopmostEditableElement(event.target as HTMLElement);

  const targetDescriptor = getDescriptor(target);

  let action = resolveAction(event.type, targetDescriptor);
  if (!action) return;

  let { value } = event;

  if (action === "press") {
    action = resolvePress(value, targetDescriptor);

    if (!action) {
      debug(
        `resolveAction: skip press ${value} on ${targetDescriptor.tag}`
      );
      return;
    }

    // skip the target visibility check for keyboard.press which has no target
    if (action === "keyboard.press") {
      return { action, selector: "", value, time: event.time };
    }
  }

  const isTargetVisible = isVisible(target, window.getComputedStyle(target));

  if (action === "click") {
    const mouseDown = events.getMouseDown();
    if (!mouseDown) {
      debug("resolveAction: skip system-initiated click");
      return;
    }

    if (!isTargetVisible && mouseDown && mouseDown.selector) {
      debug(
        "resolveAction: use selector from visible mousedown",
        mouseDown.selector,
        mouseDown.target
      );
      return { action, selector: mouseDown.selector, time: event.time };
    }
  }

  // Don't worry if check/uncheck target is visible because often invisible
  // inputs are used as bound to visible components
  if (!["check", "uncheck"].includes(action) && !isTargetVisible) {
    debug(`resolveAction: skip ${action} on invisible target`);
    return;
  }

  if (action === "fill" && !shouldTrackFill(targetDescriptor)) {
    debug(
      `resolveAction: skip fill on ${
        targetDescriptor.inputType || targetDescriptor.tag
      }`
    );
    return;
  }

  // Build the selector. We store it on the event, too, for deduping click/check/uncheck
  if (!event.selector) {
    event.selector = getSelector(
      target,
      1000,
      selectorCache
    );
  }

  let relatedClickSelector: string | undefined;
  if (["check", "uncheck"].includes(action)) {
    // value of checkbox or radio isn't needed by Playwright
    value = undefined;

    // If there is a previous click with the same selector as a check/uncheck input,
    // or with a selector that points to the related label or one of its descendants,
    // we assume that the click should be replaced by the check/uncheck in the generated
    // code.
    const clickEvents = events.getMostRecentClicks();
    let foundClickEvent: EventDescriptor | null = null;
    for (const clickEvent of clickEvents) {
      if (clickEvent.target === target) {
        debug("resolveAction: [check/uncheck] found click event with the same target");
        foundClickEvent = clickEvent;
        break;
      } else {
        const clickLabel = clickEvent.target.closest("label");
        if (clickLabel) {
          for (const relatedLabel of (target as HTMLInputElement).labels) {
            if (relatedLabel === clickLabel) {
              debug("resolveAction: [check/uncheck] found click event that descends from a related label");
              foundClickEvent = clickEvent
              break;
            }
          }
          if (foundClickEvent) break;
        }
      }
    }
    if (foundClickEvent) {
      // Some clicks do not have a selector because they were duplicate, in which
      // case we want to use the selector from the same moment in time
      if (foundClickEvent.selector) {
        relatedClickSelector = foundClickEvent.selector;
      } else {
        const dupClickEventWithSelector = clickEvents.find((event) => event.eventTimeStamp === foundClickEvent.eventTimeStamp && event.selector);
        if (dupClickEventWithSelector) relatedClickSelector = dupClickEventWithSelector.selector;
      }
      debug(`resolveAction: [check/uncheck] related click selector (to replace) is ${relatedClickSelector}`);
    }
  }

  return {
    action,
    relatedClickSelector,
    selector: event.selector,
    time: event.time,
    value,
  };
};

/**
 * @summary Determines whether a key press event should be included as part of the
 *   test code being built. Some keys are always included and some are included only
 *   when we're not editing text, i.e. the target isn't an input of some sort.
 */
export const resolvePress = (
  key: string,
  target: ElementDescriptor
): "keyboard.press" | "press" | null => {
  if (target.tag === "input") {
    return KEYS_TO_TRACK_FOR_INPUT.has(key) ? "press" : null;
  }

  if (target.tag === "textarea") {
    return KEYS_TO_TRACK_FOR_TEXTAREA.has(key) ? "press" : null;
  }

  if (target.isContentEditable) {
    return KEYS_TO_TRACK_FOR_CONTENTEDITABLE.has(key) ? "press" : null;
  }

  return KEYS_TO_TRACK_FOR_NON_INPUT.has(key) ? "keyboard.press" : null;
};

export const shouldTrackFill = (target: ElementDescriptor): boolean => {
  // File isn't supported.
  if (["file"].includes(target.inputType)) return false;

  // Track value changes for all input and textarea
  if (["input", "textarea"].includes(target.tag)) return true;

  // Track value changes for all contenteditable elements
  if (target.isContentEditable) return true;

  // Don't track value changes for anything else
  return false;
};

let allowUntrustedEvents = false;

// for testing
export const _setAllowUntrustedEvents = (value: boolean): void => {
  allowUntrustedEvents = value;
};
