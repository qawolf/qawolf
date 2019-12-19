import { Stroke, StrokeType } from "./Stroke";

export const deserializeCharacterStrokes = (value: string): Stroke[] => {
  const strokes = value.split("").map<Stroke>((character, i) => ({
    index: i,
    type: "→",
    value: character
  }));

  return strokes;
};

export const deserializeKeyStrokes = (serialized: string): Stroke[] => {
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

export const deserializeStrokes = (value: string): Stroke[] => {
  if (["→", "↓", "↑"].some(prefix => value.startsWith(prefix))) {
    return deserializeKeyStrokes(value);
  }

  return deserializeCharacterStrokes(value);
};
