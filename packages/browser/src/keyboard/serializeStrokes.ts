import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";
import { logger } from "@qawolf/logger";
import { KeyEvent } from "@qawolf/types";
import "../types"; // for USKeyboardLayout ^
import { Stroke } from "./Stroke";

// organize the KeyDefinitions from USKeyboardLayout
const keyToDefinition: { [key: string]: KeyDefinition } = {};

Object.keys(KeyDefinitions).forEach(key => {
  const definition = KeyDefinitions[key];

  if (!keyToDefinition[definition.key]) {
    keyToDefinition[definition.key] = definition;
  }
});

export const isKeyHeld = (
  events: KeyEvent[],
  thresholdMs: number = 200
): boolean => {
  /**
   * Check if any key is held down for > threshold.
   */
  for (let i = 0; i < events.length - 1; i++) {
    const keydownEvent = events[i];
    if (keydownEvent.name !== "keydown") continue;

    // find the matching keyup event
    const keyupEvent = events.find(
      (e, j) => j > i && e.name === "keyup" && e.value === keydownEvent.value
    );

    const heldTime = keyupEvent ? keyupEvent.time - keydownEvent.time : 0;
    if (heldTime > thresholdMs) {
      logger.debug(`${keydownEvent.value} was held for ${heldTime}`);
      return true;
    }
  }

  return false;
};

export const isSpecialKey = (key: string): boolean => {
  return key.length > 1;
};

export const isUSKey = (key: string): boolean => {
  return !!keyToDefinition[key];
};

export const keyToCode = (key: string): string => {
  const definition = keyToDefinition[key];

  if (!definition) throw new Error(`No code found for ${key}`);
  if (definition.code === "NumpadEnter") return "Enter";

  return definition.code;
};

export const serializeCharacterStrokes = (events: KeyEvent[]): string => {
  /**
   * This will be typed with sendCharacter.
   * Serialize down key events to a non-prefixed character string ex. "hello"
   */
  logger.debug("serializeCharacterStrokes");

  return events
    .filter(e => e.name === "keydown")
    .map(e => e.value)
    .filter(v => !isSpecialKey(v))
    .join("");
};

export const serializeKeyStrokes = (events: KeyEvent[]): string => {
  /**
   * This will be typed with keyboard.up & keyboard.down.
   * Serialize to a prefixed code string ex. "↓CtrlLeft↓KeyA↑KeyA↑CtrlLeft"
   */
  logger.debug("serializeKeyStrokes");

  const strokes: Stroke[] = events.map((e, index) => ({
    index,
    type: e.name === "keydown" ? "↓" : "↑",
    value: keyToCode(e.value)
  }));

  return strokes.map(s => `${s.type}${s.value}`).join("");
};

export const serializeKeyEvents = (events: KeyEvent[]): string => {
  /**
   * Serialize key events as character strokes or key strokes.
   */
  const hasNotUSKey = events.some(e => !isUSKey(e.value));
  if (hasNotUSKey) {
    logger.debug("serializeKeyEvents: not US key found");
    // Serialize as character strokes since it was not recorded
    // with a US keyboard so we cannot properly reproduce strokes.
    // This will sendCharacter for each keydown and skip special keys.
    // Enter & Tab are separated into another step in buildTypeSteps
    // so they will get serialized properly as key strokes below.
    return serializeCharacterStrokes(events);
  }

  // Serialize key strokes if there is a
  // - special key (ignoring shift)
  // - held key (ignoring shift)
  const keyEventsExceptShift = events.filter(e => !e.value.includes("Shift"));
  const specialKey = keyEventsExceptShift.find(e => isSpecialKey(e.value));
  const hasHeldKey = isKeyHeld(keyEventsExceptShift);
  logger.debug(
    `serializeKeyEvents: specialKey ${specialKey &&
      specialKey.value} hasHeldKey ${hasHeldKey}`
  );
  if (specialKey || hasHeldKey) {
    return serializeKeyStrokes(events);
  }

  return serializeCharacterStrokes(events);
};
