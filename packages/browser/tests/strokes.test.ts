import {
  characterToCode,
  deserializeStrokes,
  serializeStrokes,
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

describe("serializeStrokes", () => {
  it("serializes to a plain string if all strokes are ↓", () => {
    expect(serializeStrokes(stringToStrokes("嗨! 嗨!"))).toEqual("嗨! 嗨!");
  });
});

describe("stringToStrokes", () => {
  it("handles lower case characters", () => {
    const strokes = stringToStrokes("hey");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual(["↓h", "↓e", "↓y"]);
  });

  it("handles shift characters", () => {
    const strokes = stringToStrokes("YO!");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual(["↓Y", "↓O", "↓!"]);
  });

  it("handles special characters", () => {
    const strokes = stringToStrokes("嗨!嗨!");
    expect(strokes.map(s => `${s.type}${s.value}`)).toEqual([
      "↓嗨",
      "↓!",
      "↓嗨",
      "↓!"
    ]);
  });
});
