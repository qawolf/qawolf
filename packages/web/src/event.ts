import { Event } from "@qawolf/types";

export const isKeyEvent = (event: Event | null) =>
  event &&
  event.isTrusted &&
  (event.name === "keydown" || event.name === "keyup");
