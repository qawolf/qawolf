import { Event } from "@qawolf/types";

export const isKeyEvent = (event: Event | null) =>
  event &&
  event.isTrusted &&
  (event.name === "keydown" || event.name === "keyup");

export const isPasteEvent = (event: Event | null) =>
  event && event.isTrusted && event.name === "paste";

export const isTypeEvent = (event: Event | null) =>
  isKeyEvent(event) || isPasteEvent(event);
