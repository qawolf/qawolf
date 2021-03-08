import { debug } from "./debug";
import {
  ElementDescriptor,
  getDescriptor,
  getTopmostEditableElement,
  isVisible,
} from "./element";
import { Action, PossibleAction } from "./types";

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
  possibleAction: PossibleAction,
  lastPossibleAction: PossibleAction | undefined
): Action | undefined => {
  // Never emit actions for untrusted events
  if (!possibleAction.isTrusted) {
    debug("resolveAction: ignoring untrusted action");
    return;
  }

  // skip system-initiated clicks triggered by a key press
  // ex. "Enter" triggers a click on a submit input
  if (
    possibleAction.action === "click" &&
    lastPossibleAction &&
    ["fill", "press"].includes(lastPossibleAction.action) &&
    possibleAction.time - lastPossibleAction.time < 50
  ) {
    debug("resolveAction: ignoring system-initiated click");
    return;
  }

  // This should stay here to keep this fast. Put checks that don't rely on
  // target before this, and checks that do after this.
  const target = getTopmostEditableElement(
    possibleAction.target as HTMLElement
  );

  // Never emit actions on invisible targets
  if (!isVisible(target, window.getComputedStyle(target))) {
    debug("resolveAction: ignoring action on invisible target");
    return;
  }

  const targetDescriptor = getDescriptor(target);
  let action = possibleAction.action as Action;

  if (targetDescriptor.tag === "select") {
    // On selects, ignore everything except fill actions (input / change events)
    if (action !== "fill") {
      debug("resolveAction: ignoring non-fill action on a select element");
      return;
    }
    action = "selectOption";
  }

  if (
    action === "press" &&
    !shouldTrackKeyPress(possibleAction.value, targetDescriptor)
  ) {
    debug(
      "resolveAction: ignoring press action for an unimportant key or target"
    );
    return;
  }

  if (action === "fill" && !shouldTrackFill(targetDescriptor)) {
    debug("resolveAction: ignoring fill action for an unimportant target");
    return;
  }

  return action;
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

/**
 * @summary Determines whether a key press event should be included as part of the
 *   test code being built. Some keys are always included and some are included only
 *   when we're not editing text, i.e. the target isn't an input of some sort.
 * @param {String} key The name of the key that was pressed.
 * @param {Object} target Some details about the event target.
 * @return {Boolean} True if we should include this key as part of the playback script.
 */
export const shouldTrackKeyPress = (
  key: string,
  target: ElementDescriptor
): boolean => {
  if (target.tag === "input") return KEYS_TO_TRACK_FOR_INPUT.has(key);
  if (target.tag === "textarea") return KEYS_TO_TRACK_FOR_TEXTAREA.has(key);

  if (target.isContentEditable) {
    return KEYS_TO_TRACK_FOR_CONTENTEDITABLE.has(key);
  }

  return KEYS_TO_TRACK_FOR_NON_INPUT.has(key);
};
