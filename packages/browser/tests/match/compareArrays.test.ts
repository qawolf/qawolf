import { compareArrays } from "@qawolf/web";

describe("compareArrays", () => {
  it("returns 0 if either array is null", () => {
    expect(compareArrays(null, ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], null)).toBe(0);
  });

  it("returns 0 if either array is empty", () => {
    expect(compareArrays([], ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], [])).toBe(0);
  });

  it("returns the share of base items in compare", () => {
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "bear"])).toBe(50);
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "spirit"])).toBe(50);
  });
});
