import { getTopmostEditableElement, isVisible } from "./element";
import { nodeToDoc } from "./serialize";
import { Action, Doc, PossibleAction } from "./types";

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
const KEYS_TO_TRACK_FOR_NON_INPUT = new Set([
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
    console.debug("resolveAction: ignoring untrusted action");
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
    console.debug("resolveAction: ignoring system-initiated click");
    return;
  }

  // This should stay here to keep this fast. Put checks that don't rely on
  // target before this, and checks that do after this.
  const target = getTopmostEditableElement(
    possibleAction.target as HTMLElement
  );

  // Never emit actions on invisible targets
  if (!isVisible(target, window.getComputedStyle(target))) {
    console.debug("resolveAction: ignoring action on invisible target");
    return;
  }

  const targetDoc = nodeToDoc(target);
  let action = possibleAction.action as Action;

  if (targetDoc.name === "select") {
    // On selects, ignore everything except fill actions (input / change events)
    if (action !== "fill") {
      console.debug(
        "resolveAction: ignoring non-fill action on a select element"
      );
      return;
    }
    action = "selectOption";
  }

  if (
    action === "press" &&
    !shouldTrackKeyPress(possibleAction.value, targetDoc)
  ) {
    console.debug(
      "resolveAction: ignoring press action for an unimportant key or target"
    );
    return;
  }

  if (action === "fill" && !shouldTrackFill(targetDoc)) {
    console.debug(
      "resolveAction: ignoring fill action for an unimportant target"
    );
    return;
  }

  return action;
};

export const shouldTrackFill = (target: Doc): boolean => {
  const { contenteditable, type } = target.attrs || {};

  // Some inputs emit "change" with a value but really can't or shouldn't be
  // "filled in" with that value. Checkbox and radio should work without filling
  // because there will be click events. File isn't supported.
  if (["checkbox", "radio", "file"].includes(type)) return false;

  // Track value changes for all input and textarea
  if (["input", "textarea"].includes(target.name)) return true;

  // Track value changes for all contenteditable elements
  if (typeof contenteditable === "string" && contenteditable !== "false")
    return true;

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
export const shouldTrackKeyPress = (key: string, target: Doc): boolean => {
  if (target.name === "input") return KEYS_TO_TRACK_FOR_INPUT.has(key);
  if (target.name === "textarea") return KEYS_TO_TRACK_FOR_TEXTAREA.has(key);

  const { contenteditable } = target.attrs || {};
  if (typeof contenteditable === "string" && contenteditable !== "false") {
    return KEYS_TO_TRACK_FOR_CONTENTEDITABLE.has(key);
  }

  return KEYS_TO_TRACK_FOR_NON_INPUT.has(key);
};
