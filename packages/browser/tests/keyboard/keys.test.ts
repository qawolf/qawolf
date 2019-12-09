import { characterToCode } from "../../src/keyboard/keys";

describe("characterToCode", () => {
  it("converts a character to it's USKeyboard code", () => {
    expect(characterToCode("S")).toEqual("KeyS");
  });

  it("converts a non-USKeyboard character to null", () => {
    expect(characterToCode("嗨")).toEqual(null);
  });
});
