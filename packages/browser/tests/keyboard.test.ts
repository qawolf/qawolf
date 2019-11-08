import { buildStrokesForString, deserializeStrokes } from "../src/keyboard";

describe("buildStrokesForString", () => {
  it("handles lower case characters", () => {
    const strokes = buildStrokesForString("hey");
    expect(strokes.map(s => `${s.prefix}${s.code}`)).toEqual([
      "↓KeyH",
      "↑KeyH",
      "↓KeyE",
      "↑KeyE",
      "↓KeyY",
      "↑KeyY"
    ]);
  });

  it("handles shift characters", () => {
    const strokes = buildStrokesForString("YO!");
    expect(strokes.map(s => `${s.prefix}${s.code}`)).toEqual([
      "↓Shift",
      "↓KeyY",
      "↑KeyY",
      "↑Shift",
      "↓Shift",
      "↓KeyO",
      "↑KeyO",
      "↑Shift",
      "↓Shift",
      "↓Digit1",
      "↑Digit1",
      "↑Shift"
    ]);
  });
});

describe("deserializeStrokes", () => {
  it("converts a string to strokes", () => {
    const strokes = deserializeStrokes("↓Shift↓KeyY↑KeyY");
    expect(strokes.map(s => `${s.prefix}${s.code}`)).toEqual([
      "↓Shift",
      "↓KeyY",
      "↑KeyY"
    ]);
  });
});
