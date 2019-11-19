import { deserializeStrokes, stringToStrokes } from "../src/keyboard";

describe("deserializeStrokes", () => {
  it("converts a string to strokes", () => {
    const strokes = deserializeStrokes("↓Shift↓KeyY↑KeyY");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "↓Shift",
      "↓KeyY",
      "↑KeyY"
    ]);
  });
});

describe("stringToStrokes", () => {
  it("handles lower case characters", () => {
    const strokes = stringToStrokes("hey");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "↓KeyH",
      "↑KeyH",
      "↓KeyE",
      "↑KeyE",
      "↓KeyY",
      "↑KeyY"
    ]);
  });

  it("handles shift characters", () => {
    const strokes = stringToStrokes("YO!");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
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

  it("handles special characters", () => {
    throw new Error("TO DO");
  });
});
