import { isNil } from "@qawolf/web";

describe("isNil", () => {
  it("returns true if argument is null", () => {
    expect(isNil(null)).toBe(true);
  });

  it("returns true if argument is undefined", () => {
    expect(isNil()).toBe(true);
  });

  it("returns false if argument not null or undefined", () => {
    expect(isNil("spirit")).toBe(false);
    expect(isNil(11)).toBe(false);
    expect(isNil({})).toBe(false);
    expect(isNil([])).toBe(false);
  });
});
