import { codeToCharacter } from "./keys";
import { Stroke } from "./Stroke";

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
