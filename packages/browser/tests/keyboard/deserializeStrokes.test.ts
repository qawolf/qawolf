import { deserializeStrokes } from "../../src/keyboard/deserializeStrokes";

describe("deserializeStrokes", () => {
  it("converts a string to strokes with deserializeStrokes", () => {
    const strokes = deserializeStrokes("↓Shift↓KeyY↑KeyY")!;
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "↓Shift",
      "↓KeyY",
      "↑KeyY"
    ]);
  });

  it("returns null for a sequence of characters", () => {
    const strokes = deserializeStrokes("hey YO! 嗨");
    expect(strokes).toEqual(null);
  });
});
