import { Doc } from "./types";

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
