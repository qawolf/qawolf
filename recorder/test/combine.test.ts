import { combine } from "../src/combine";

describe("combine", () => {
  it("builds combinations for the specified size", () => {
    expect(combine([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
      [4, 5],
    ]);

    expect(combine([1, 2, 3, 4], 3)).toEqual([
      [1, 2, 3],
      [1, 2, 4],
      [1, 3, 4],
      [2, 3, 4],
    ]);
  });
});
