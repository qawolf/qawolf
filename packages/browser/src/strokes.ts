import { flatten } from "lodash";
import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";
import "./types";

// → keyboard.sendCharacter(char)
// ↓ keyboard.down(key)
// ↑ keyboard.up(key)
export type StrokeType = "→" | "↓" | "↑";

export type Stroke = {
  index: number;
  type: StrokeType;
  value: string;
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

export const characterToCode = (character: string): string | null => {
  const definition = keyToDefinition[character];
  return definition ? definition.code : null;
};

export const characterToStrokes = (character: string): Stroke[] => {
  const strokes: Stroke[] = [];

  const shiftKeyDefinition = shiftKeyToDefinitions[character];
  const keyDefinition = keyToDefinition[character];

  if (!shiftKeyDefinition && !keyDefinition) {
    // sendCharacter if we cannot find the key definition
    strokes.push({
      index: strokes.length,
      type: "→",
      value: character
    });

    return strokes;
  }

  const code = shiftKeyDefinition
    ? shiftKeyDefinition.code
    : keyDefinition.code;

  if (shiftKeyDefinition) {
    strokes.push({
      index: strokes.length,
      type: "↓",
      value: "Shift"
    });
  }

  strokes.push({
    index: strokes.length,
    type: "↓",
    value: code
  });

  strokes.push({
    index: strokes.length,
    type: "↑",
    value: code
  });

  if (shiftKeyDefinition) {
    strokes.push({
      index: strokes.length,
      type: "↑",
      value: "Shift"
    });
  }

  return strokes;
};

export const deserializeStrokes = (serialized: string) => {
  const strokes: Stroke[] = [];

  // split by prefix with positive lookahead https://stackoverflow.com/a/12001989
  for (let key of serialized.split(/(?=→|↓|↑)/)) {
    const code = key.substring(1);

    strokes.push({
      index: strokes.length,
      type: key[0] as StrokeType,
      value: code
    });
  }

  return strokes;
};

export const serializeStrokes = (strokes: Stroke[]) => {
  return strokes
    .sort((a, b) => a.index - b.index)
    .map(s => `${s.type}${s.value}`)
    .join("");
};

export const stringToStrokes = (value: string): Stroke[] => {
  return flatten(
    value.split("").map(character => characterToStrokes(character))
  );
};

export const valueToStrokes = (value: string): Stroke[] => {
  if (["→", "↓", "↑"].some(prefix => value.startsWith(prefix))) {
    return deserializeStrokes(value);
  }

  return stringToStrokes(value);
};
