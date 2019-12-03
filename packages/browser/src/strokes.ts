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
  if (!keyToDefinition[definition.key]) {
    keyToDefinition[definition.key] = definition;
  }
});

export const characterToCode = (character: string): string | null => {
  const definition = keyToDefinition[character];
  return definition ? definition.code : null;
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
  const sortedStrokes = strokes.sort((a, b) => a.index - b.index);

  if (sortedStrokes.every(s => s.type === "↓")) {
    return sortedStrokes.map(s => s.value).join("");
  }

  return sortedStrokes.map(s => `${s.type}${s.value}`).join("");
};

export const stringToStrokes = (value: string): Stroke[] => {
  return value.split("").map((character, index) => ({
    index,
    type: "↓",
    value: character
  }));
};

export const valueToStrokes = (value: string): Stroke[] => {
  if (["→", "↓", "↑"].some(prefix => value.startsWith(prefix))) {
    return deserializeStrokes(value);
  }

  return stringToStrokes(value);
};
