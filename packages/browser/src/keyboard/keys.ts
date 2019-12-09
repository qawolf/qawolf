import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";
import { Stroke } from "./Stroke";
import "../types";

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
