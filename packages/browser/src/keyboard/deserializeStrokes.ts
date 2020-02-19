import { Stroke, StrokeType } from "./Stroke";

export const deserializeStrokes = (serialized: string): Stroke[] | null => {
  if (!["→", "↓", "↑"].some(prefix => serialized.startsWith(prefix))) {
    return null;
  }

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
