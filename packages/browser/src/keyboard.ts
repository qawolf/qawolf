import "./types";
import KeyDefinitions, { KeyDefinition } from "puppeteer/lib/USKeyboardLayout";

const keyToDefinition: { [key: string]: KeyDefinition } = {};

Object.keys(KeyDefinitions).forEach(key => {
  const definition = KeyDefinitions[key];
  // only map each key once
  if (keyToDefinition[definition.key]) return;

  keyToDefinition[definition.key] = definition;
});

export const buildCodeString = (value: string) => {
  if (value.indexOf("↓") === 0) return value;

  return value
    .split("")
    .map(key => {
      const code = keyToDefinition[key].code;
      return `↓${code}↑${code}`;
    })
    .join("");
};
