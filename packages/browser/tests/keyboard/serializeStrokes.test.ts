import { keyToCode } from "../../src/keyboard/serializeStrokes";

describe("keyToCode", () => {
  it("converts a character to it's USKeyboard code", () => {
    expect(keyToCode("S")).toEqual("KeyS");
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
