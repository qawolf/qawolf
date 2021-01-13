import { Doc } from "./types";

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
