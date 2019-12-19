import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";
import "../types";

// organizes the KeyDefinitions from USKeyboardLayout
const codeToDefinition: { [code: string]: KeyDefinition } = {};
const keyToDefinition: { [key: string]: KeyDefinition } = {};
const shiftCodeToDefinition: { [code: string]: KeyDefinition } = {};

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
  }
});

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

export const keyToCode = (key: string): string | null => {
  const definition = keyToDefinition[key];
  return definition ? definition.code : null;
};
