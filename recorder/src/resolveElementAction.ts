import { debug } from "./debug";
import {
  ElementDescriptor,
  getDescriptor,
  getTopmostEditableElement,
  isVisible,
} from "./element";
import { EventSequence } from "./EventSequence";
import { Action, ElementAction, EventDescriptor } from "./types";

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

export const resolveEventAction = (
  event: EventDescriptor
): Action | undefined => {
  let action: Action;

  if (event.type === "change" || event.type === "input") {
    action = event.target.tagName === "SELECT" ? "selectOption" : "fill";
  } else if (event.type === "click") {
    action = "click";
  } else if (event.type === "keydown") {
    action = "press";
  }

  if (event.target.tagName === "SELECT" && action !== "selectOption") {
    debug(`resolveAction: skip ${action} on select`);
    action = undefined;
  }

  return action;
};

export const resolveElementAction = (
  events: EventSequence
): ElementAction | undefined => {
  const event = events.last;
  if (!event.isTrusted) {
    debug("resolveAction: skip untrusted action");
    return;
  }

  let action = resolveEventAction(event);
  if (!action) return;

  if (events.isDuplicateChangeOrInput()) {
    debug(`resolveAction: skip duplicate ${action}`);
    return;
  }

  // This should stay here to keep this fast. Put checks that don't rely on
  // target before this, and checks that do after this.
  const target = getTopmostEditableElement(event.target as HTMLElement);

  const targetDescriptor = getDescriptor(target);

  if (action === "press") {
    action = resolvePress(event.value, targetDescriptor);

    if (!action) {
      debug(
        `resolveAction: skip press ${event.value} on ${targetDescriptor.tag}`
      );
      return;
    }

    // skip the target visibility check for keyboard.press which has no target
    if (action === "keyboard.press") {
      return { action, selector: "", value: event.value, time: event.time };
    }
  }

  if (action === "click") {
    const mouseDown = events.getMouseDown();
    if (!mouseDown) {
      debug("resolveAction: skip system-initiated click");
      return;
    }

    if (!isVisible(target, window.getComputedStyle(target))) {
      if (!mouseDown.selector) {
        debug("resolveAction: skip action on invisible target");
        return;
      }

      debug(
        "resolveAction: use selector from visible mousedown",
        mouseDown.selector,
        mouseDown.target
      );
      return { action, selector: mouseDown.selector, time: event.time };
    }
  }

  if (action === "fill" && !shouldTrackFill(targetDescriptor)) {
    debug(
      `resolveAction: skip fill on ${
        targetDescriptor.inputType || targetDescriptor.tag
      }`
    );
    return;
  }

  return {
    action,
    selector: event.selector,
    time: event.time,
    value: event.value,
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
  // Some inputs emit "change" with a value but really can't or shouldn't be
  // "filled in" with that value. Checkbox and radio should work without filling
  // because there will be click events. File isn't supported.
  if (["checkbox", "radio", "file"].includes(target.inputType)) return false;

  // Track value changes for all input and textarea
  if (["input", "textarea"].includes(target.tag)) return true;

  // Track value changes for all contenteditable elements
  if (target.isContentEditable) return true;

  // Don't track value changes for anything else
  return false;
};
