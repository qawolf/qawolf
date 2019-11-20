import {
  characterToCode,
  deserializeStrokes,
  stringToStrokes
} from "../src/strokes";

describe("characterToCode", () => {
  it("converts a character to it's USKeyboard code", () => {
    expect(characterToCode("S")).toEqual("KeyS");
  });

  it("converts a non-USKeyboard character to null", () => {
    expect(characterToCode("嗨")).toEqual(null);
  });
});

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
    const strokes = stringToStrokes("嗨!嗨!");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "→嗨",
      "↓Shift",
      "↓Digit1",
      "↑Digit1",
      "↑Shift",
      "→嗨",
      "↓Shift",
      "↓Digit1",
      "↑Digit1",
      "↑Shift"
    ]);
  });
});
