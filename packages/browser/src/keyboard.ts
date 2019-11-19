import { Event } from "@qawolf/types";
import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";
import "./types";

// A Press is the pair of corresponding down and up key events
export type Press = {
  code: string;
  downEvent: Event;
  downEventIndex: number;
  upEventIndex: number | null;
  xpath: string;
};

// A Stroke is a single keydown or keyup
export type Stroke = {
  code: string;
  index: number;
  prefix: "↓" | "↑";
};

// organizes the KeyDefinitions from USKeyboardLayout
const keyToDefinition: { [key: string]: KeyDefinition } = {};
Object.keys(KeyDefinitions).forEach(key => {
  const definition = KeyDefinitions[key];
  // only map each key once
  if (keyToDefinition[definition.key]) return;

  keyToDefinition[definition.key] = definition;
});

const shiftKeyToDefinitions: { [key: string]: KeyDefinition } = {};
Object.values(KeyDefinitions).forEach(definition => {
  if (!definition.shiftKey) return;
  // only map each key once
  if (shiftKeyToDefinitions[definition.shiftKey]) return;

  shiftKeyToDefinitions[definition.shiftKey] = definition;
});

export const buildStrokesForString = (keysToType: string) => {
  // convert a regular string to Strokes
  const strokes: Stroke[] = [];

  keysToType.split("").forEach(key => {
    // null if not a shift key
    const shiftKeyDefinition = shiftKeyToDefinitions[key];

    const code = shiftKeyDefinition
      ? shiftKeyDefinition.code
      : keyToDefinition[key].code;

    if (shiftKeyDefinition) {
      strokes.push({
        code: "Shift",
        index: strokes.length,
        prefix: "↓"
      });
    }

    strokes.push({
      code,
      index: strokes.length,
      prefix: "↓"
    });

    strokes.push({
      code,
      index: strokes.length,
      prefix: "↑"
    });

    if (shiftKeyDefinition) {
      strokes.push({
        code: "Shift",
        index: strokes.length,
        prefix: "↑"
      });
    }
  });

  return strokes;
};

export const convertPressesToStrokes = (presses: Press[]) => {
  const strokes: Stroke[] = [];

  presses.forEach(p => {
    strokes.push({ code: p.code, index: p.downEventIndex, prefix: "↓" });

    if (p.upEventIndex !== null) {
      strokes.push({ code: p.code, index: p.upEventIndex, prefix: "↑" });
    }
  });

  return strokes.sort((a, b) => a.index - b.index);
};

export const convertStringToStrokes = (value: string): Stroke[] => {
  if (isSerializedStrokes(value)) return deserializeStrokes(value);

  return buildStrokesForString(value);
};

export const deserializeStrokes = (serialized: string) => {
  const strokes: Stroke[] = [];

  // split by ↓,↑ with positive lookahead https://stackoverflow.com/a/12001989
  for (let key of serialized.split(/(?=↓|↑)/)) {
    const code = key.substring(1);

    strokes.push({
      code,
      index: strokes.length,
      prefix: key[0] as "↓" | "↑"
    });
  }

  return strokes;
};

export const isSerializedStrokes = (value: string) => value.startsWith("↓");

export const serializeStrokes = (strokes: Stroke[]) => {
  return strokes
    .sort((a, b) => a.index - b.index)
    .map(s => `${s.prefix}${s.code}`)
    .join("");
};
