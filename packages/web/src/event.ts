import { ElementEvent } from "@qawolf/types";

export const isKeyEvent = (event: ElementEvent | null) =>
  event &&
  event.isTrusted &&
  (event.name === "keydown" || event.name === "keyup");

export const isPasteEvent = (event: ElementEvent | null) =>
  event && event.isTrusted && event.name === "paste";

export const isSelectAllEvent = (event: ElementEvent | null) =>
  event && event.isTrusted && event.name === "selectall";

export const isTypeEvent = (event: ElementEvent | null) =>
  isKeyEvent(event) || isPasteEvent(event);
