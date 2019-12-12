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
          "→嗨↓Shift↓KeyS↑Shift↑KeyS↓KeyU↑KeyU↓KeyP↓Shift↑KeyP↓Digit1↑Digit1↑Shift"
        )
      )
    ).toEqual("嗨Sup!");

    expect(
      serializeStrokes(
        deserializeStrokes(
          "↓KeyL↑KeyL↓KeyA↓KeyU↑KeyA↓KeyR↑KeyU↑KeyR↓KeyA↑KeyA↓ShiftLeft↓Digit2↑ShiftLeft↑Digit2↓KeyG↑KeyG↓KeyM↑KeyM↓KeyA↓KeyI↑KeyA↓KeyL↑KeyI↑KeyL↓Period↑Period↓KeyC↓KeyO↑KeyC↓KeyM↑KeyO↑KeyM"
        )
      )
    ).toEqual("laura@gmail.com");
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
