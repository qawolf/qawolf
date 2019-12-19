import {
  deserializeStrokes,
  keyEventToStroke,
  serializeStrokes,
  stringToStrokes
} from "../../src/keyboard/serializeStrokes";

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

describe("keyEventToStroke", () => {
  describe("keydown", () => {
    it("converts single character keys to sendCharacter", () => {
      expect(keyEventToStroke("keydown", "h", 0)).toEqual({
        index: 0,
        type: "→",
        value: "h"
      });
      expect(keyEventToStroke("keydown", "嗨", 0)).toEqual({
        index: 0,
        type: "→",
        value: "嗨"
      });
    });

    it("converts special character keys to keyboard.down", () => {
      expect(keyEventToStroke("keydown", "Enter", 0)).toEqual({
        index: 0,
        type: "↓",
        value: "NumpadEnter"
      });
    });
  });

  describe("keyup", () => {
    it("skips single character keys", () => {
      expect(keyEventToStroke("keyup", "h", 0)).toEqual(null);
      expect(keyEventToStroke("keyup", "嗨", 0)).toEqual(null);
    });

    it("converts special character keys to keyboard.up", () => {
      expect(keyEventToStroke("keyup", "Tab", 0)).toEqual({
        index: 0,
        type: "↑",
        value: "Tab"
      });
    });
  });
});

describe("serializeStrokes", () => {
  it("serializes to a plain string if possible", () => {
    expect(serializeStrokes(stringToStrokes("嗨! 嗨!"))).toEqual("嗨! 嗨!");
  });

  it("serializes special keys to prefixed value", () => {
    expect(serializeStrokes(deserializeStrokes("↓Enter↑Enter"))).toEqual(
      "↓Enter↑Enter"
    );

    expect(serializeStrokes(deserializeStrokes("↓Tab↑Tab"))).toEqual(
      "↓Tab↑Tab"
    );
  });
});

describe("stringToStrokes", () => {
  it("converts to a sequence of sendCharacter", () => {
    const strokes = stringToStrokes("hey YO! 嗨");
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
