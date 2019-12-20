import { KeyEvent } from "@qawolf/types";
import {
  isKeyHeld,
  isSpecialKey,
  isUSKey,
  keyToCode,
  serializeCharacterStrokes,
  serializeKeyEvents,
  serializeKeyStrokes
} from "../../src/keyboard/serializeStrokes";

describe("isKeyHeld", () => {
  it("returns true if a key is held for > 200ms", () => {
    expect(
      isKeyHeld([
        { name: "keydown", time: 0, value: "s" },
        { name: "keyup", time: 201, value: "s" }
      ] as any)
    ).toEqual(true);
  });

  it("returns false if a key is released within 200ms", () => {
    expect(
      isKeyHeld([
        { name: "keydown", time: 0, value: "s" },
        { name: "keyup", time: 200, value: "s" }
      ] as any)
    ).toEqual(false);
  });

  it("returns false if a key is not released", () => {
    expect(
      isKeyHeld([{ name: "keydown", time: 0, value: "s" }] as any)
    ).toEqual(false);
  });
});

describe("isSpecialKey", () => {
  it("returns true for special keys", () => {
    expect(isSpecialKey("Enter")).toEqual(true);
    expect(isSpecialKey("Shift")).toEqual(true);
  });

  it("returns false for normal keys", () => {
    expect(isSpecialKey("3")).toEqual(false);
    expect(isSpecialKey("s")).toEqual(false);
  });
});

describe("isUSKey", () => {
  it("returns true for US keys", () => {
    expect(isUSKey("Enter")).toEqual(true);
    expect(isUSKey("3")).toEqual(true);
  });

  it("returns false for international keys", () => {
    expect(isUSKey("ö")).toEqual(false);
    expect(isUSKey("嗨")).toEqual(false);
  });
});

describe("keyToCode", () => {
  it("converts a character to it's USKeyboard code", () => {
    expect(keyToCode("S")).toEqual("KeyS");
  });

  it("serializes Enter properly", () => {
    expect(keyToCode("Enter")).not.toEqual("NumpadEnter");
    expect(keyToCode("Enter")).toEqual("Enter");
  });

  it("throws an error for a non-USKeyboard character", () => {
    let message = false;
    try {
      expect(keyToCode("嗨")).toEqual(null);
    } catch (e) {
      message = e.message;
    }

    expect(message).toEqual("No code found for 嗨");
  });
});

describe("serialize helpers", () => {
  const events = ["Shift", "Shift", "H", "H", "e", "e", "y", "y"].map(
    (value, index) => ({
      name: index % 2 == 0 ? "keydown" : "keyup",
      value
    })
  );

  describe("serializeCharacterStrokes", () => {
    it("serializes regular keys to non-prefixed string", () => {
      expect(serializeCharacterStrokes(events as any)).toEqual("Hey");
    });
  });

  describe("serializeKeyStrokes", () => {
    it("serializes all keys to a prefixed code string", () => {
      expect(serializeKeyStrokes(events as any)).toEqual(
        "↓ShiftLeft↑ShiftLeft↓KeyH↑KeyH↓KeyE↑KeyE↓KeyY↑KeyY"
      );
    });
  });
});

describe("serializeKeyEvents", () => {
  it("serializes to character strokes: if there is an international key", () => {
    expect(
      serializeKeyEvents([
        { name: "keydown", value: "嗨" },
        { name: "keydown", value: "!" }
      ] as any)
    ).toEqual("嗨!");
  });

  it("serializes to key strokes: if there is a special key", () => {
    expect(
      serializeKeyEvents([
        { name: "keydown", time: 0, value: "Control" },
        { name: "keydown", time: 0, value: "s" },
        { name: "keyup", time: 0, value: "s" },
        { name: "keyup", time: 0, value: "Control" }
      ] as any)
    ).toEqual("↓ControlLeft↓KeyS↑KeyS↑ControlLeft");
  });

  it("serializes to key strokes: if a key (other than Shift) is held down for > 200 ms", () => {
    const events = [
      { name: "keydown", time: 0, value: "s" },
      { name: "keyup", time: 201, value: "s" }
    ];
    expect(serializeKeyEvents(events as any)).toEqual("↓KeyS↑KeyS");
  });
});
