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
const codeToDefinition: { [code: string]: KeyDefinition } = {};
const keyToDefinition: { [key: string]: KeyDefinition } = {};
const shiftCodeToDefinition: { [code: string]: KeyDefinition } = {};
const shiftKeyToDefinition: { [key: string]: KeyDefinition } = {};

Object.keys(KeyDefinitions).forEach(key => {
  const definition = KeyDefinitions[key];

  // only map each key once
  if (!codeToDefinition[definition.code]) {
    codeToDefinition[definition.code] = definition;
  }

  if (!keyToDefinition[definition.key]) {
    keyToDefinition[definition.key] = definition;
  }

  if (definition.shiftKey) {
    if (!shiftCodeToDefinition[definition.code]) {
      shiftCodeToDefinition[definition.code] = definition;
    }

    if (!shiftKeyToDefinition[definition.shiftKey]) {
      shiftKeyToDefinition[definition.shiftKey] = definition;
    }
  }
});

export const characterToCode = (character: string): string | null => {
  const definition = keyToDefinition[character];
  return definition ? definition.code : null;
};

export const characterToStrokes = (character: string): Stroke[] => {
  const strokes: Stroke[] = [];

  const shiftKeyDefinition = shiftKeyToDefinition[character];
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

export const codeToCharacter = (
  code: string,
  shift: boolean = false
): string => {
  let character: string;

  if (shift) {
    character = shiftCodeToDefinition[code]!.shiftKey!;
  } else {
    character = codeToDefinition[code]!.key;
  }

  if (character.length > 1) {
    throw new Error("cannot convert special code to character");
  }

  return character;
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

export const serializeSimpleStrokes = (strokes: Stroke[]): string => {
  let str = "";

  let downStroke: Stroke | null = null;
  let shift = false;

  for (let index = 0; index < strokes.length; index++) {
    const stroke = strokes[index];

    if (stroke.type === "→") {
      str += stroke.value;
    } else if (stroke.type === "↓") {
      if (stroke.value === "Shift") {
        if (shift) {
          throw new Error("sequential shifts");
        }

        shift = true;
        continue;
      }

      if (downStroke) {
        throw new Error("sequential down strokes");
      }

      str += codeToCharacter(stroke.value, shift);
      downStroke = stroke;
    } else if (stroke.type === "↑") {
      if (stroke.value === "Shift") {
        shift = false;
      } else if (!downStroke || downStroke!.value !== stroke.value) {
        throw new Error(
          `up stroke ${stroke.value} does not match down stroke ${downStroke}`
        );
      }

      downStroke = null;
    }
  }

  return str;
};

export const serializeStrokes = (strokes: Stroke[]) => {
  const sortedStrokes = strokes.sort((a, b) => a.index - b.index);

  try {
    return serializeSimpleStrokes(sortedStrokes);
  } catch (e) {}

  return sortedStrokes.map(s => `${s.type}${s.value}`).join("");
};

export const stringToStrokes = (value: string): Stroke[] => {
  const strokes = flatten(
    value.split("").map(character => characterToStrokes(character))
  );

  strokes.forEach((s, i) => (s.index = i));

  return strokes;
};

export const valueToStrokes = (value: string): Stroke[] => {
  if (["→", "↓", "↑"].some(prefix => value.startsWith(prefix))) {
    return deserializeStrokes(value);
  }

  return stringToStrokes(value);
};
