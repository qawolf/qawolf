import { flatten } from "lodash";
import { characterToStrokes } from "./keys";
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

export const serializeStrokes = (strokes: Stroke[]) => {
  const sortedStrokes = strokes.sort((a, b) => a.index - b.index);

  try {
    return simplifyStrokes(sortedStrokes);
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
