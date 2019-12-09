import {
  deserializeStrokes,
  serializeStrokes,
  stringToStrokes
} from "../../src/keyboard/serializeStrokes";
import { simplifyStrokes } from "../../src/keyboard/simplifyStrokes";

describe("simplifyStrokes", () => {
  it("serializes to a plain string if all strokes are →", () => {
    expect(simplifyStrokes(stringToStrokes("嗨! 嗨!"))).toEqual("嗨! 嗨!");
  });

  it("serializes to a plain string if there are no special keys", () => {
    expect(
      serializeStrokes(
        deserializeStrokes(
          "↓Shift↓KeyS→嗨↑Shift↑KeyS↓KeyU↑KeyU↓KeyP↓Shift↑KeyP↓Digit1↑Digit1↑Shift"
        )
      )
    ).toEqual("S嗨up!");
  });

  it("throws an error if there are special keys", () => {
    expect(() => {
      simplifyStrokes(deserializeStrokes("↓Enter↑Enter"));
    }).toThrow();

    expect(() => {
      simplifyStrokes(deserializeStrokes("↓KeyS↓Tab↑KeyS"));
    }).toThrow();
  });
});
