import { KeyEvent } from "@qawolf/types";
import { keyToCode } from "./keys";
import { simplifyStrokes } from "./simplifyStrokes";
import { Stroke, StrokeType } from "./Stroke";

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

export const keyEventToStroke = (
  name: "keydown" | "keyup",
  // KeyboardEvent.key
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
  key: string,
  index: number
): Stroke | null => {
  if (key.length === 1) {
    // if the key is once character use sendCharacter
    // this allows us to support international characters
    // and skip keyup strokes
    if (name === "keyup") return null;

    return {
      index,
      type: "→",
      value: key
    };
  }

  // if the key is longer than a character it's a special key
  // so use keyboard.up(code)/ keyboard.down(code)
  const code = keyToCode(key);
  if (!code) throw new Error(`${key} was not recognized`);

  return {
    index,
    type: name === "keydown" ? "↓" : "↑",
    value: code
  };
};

export const serializeStrokes = (strokes: Stroke[]) => {
  const sortedStrokes = strokes.sort((a, b) => a.index - b.index);

  try {
    return simplifyStrokes(sortedStrokes);
  } catch (e) {}

  return sortedStrokes.map(s => `${s.type}${s.value}`).join("");
};

export const stringToStrokes = (value: string): Stroke[] => {
  const strokes = value.split("").map<Stroke>((character, i) => ({
    index: i,
    type: "→",
    value: character
  }));

  return strokes;
};

export const valueToStrokes = (value: string): Stroke[] => {
  if (["→", "↓", "↑"].some(prefix => value.startsWith(prefix))) {
    return deserializeStrokes(value);
  }

  return stringToStrokes(value);
};
