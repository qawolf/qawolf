import { keyToCode } from "../../src/keyboard/keys";

describe("keyToCode", () => {
  it("converts a character to it's USKeyboard code", () => {
    expect(keyToCode("S")).toEqual("KeyS");
  });

  it("converts a non-USKeyboard character to null", () => {
    expect(keyToCode("嗨")).toEqual(null);
  });
});
