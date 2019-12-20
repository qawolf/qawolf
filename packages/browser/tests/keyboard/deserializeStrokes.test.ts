import {
  deserializeCharacterStrokes,
  deserializeStrokes
} from "../../src/keyboard/deserializeStrokes";

describe("deserializeStrokes", () => {
  it("converts a string to strokes with deserializeKeyStrokes", () => {
    const strokes = deserializeStrokes("↓Shift↓KeyY↑KeyY");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "↓Shift",
      "↓KeyY",
      "↑KeyY"
    ]);
  });
});

describe("deserializeCharacterStrokes", () => {
  it("converts to a sequence of sendCharacter", () => {
    const strokes = deserializeCharacterStrokes("hey YO! 嗨");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "→h",
      "→e",
      "→y",
      "→ ",
      "→Y",
      "→O",
      "→!",
      "→ ",
      "→嗨"
    ]);
  });
});
