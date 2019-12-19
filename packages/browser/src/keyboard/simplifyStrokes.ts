import { codeToCharacter } from "./keys";
import { Stroke } from "./Stroke";

class StrokeParser {
  /**
   * It is possible to simplify strokes to a plain string when Shift is the only special key
   * because we can map the down strokes to their shift values.
   */
  private _strokes: Stroke[];
  private _simplified: string = "";
  private _shiftDown: boolean = false;

  constructor(strokes: Stroke[]) {
    this._strokes = strokes;
  }

  parseDown(stroke: Stroke) {
    if (stroke.value.includes("Shift")) {
      if (this._shiftDown) {
        throw new Error("sequential shifts");
      }

      this._shiftDown = true;
      return;
    }

    // this will throw an error for special keys
    this._simplified += codeToCharacter(stroke.value, this._shiftDown);
  }

  parseSend(stroke: Stroke) {
    this._simplified += stroke.value;
  }

  parseUp(stroke: Stroke) {
    if (stroke.value.includes("Shift")) {
      this._shiftDown = false;
    }
  }

  public simplify(): string {
    this._strokes.forEach(stroke => {
      if (stroke.type === "→") this.parseSend(stroke);
      else if (stroke.type === "↓") this.parseDown(stroke);
      else if (stroke.type === "↑") this.parseUp(stroke);
    });

    return this._simplified;
  }
}

export const simplifyStrokes = (strokes: Stroke[]): string => {
  /**
   * Simplify strokes to a plain string if possible.
   * Throw an error if not possible.
   */
  const parser = new StrokeParser(strokes);
  return parser.simplify();
};
