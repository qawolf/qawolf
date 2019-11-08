import { formatMethod } from "../src/formatMethod";

describe("formatMethod", () => {
  it("throws error if invalid step action", () => {
    expect(() => {
      formatMethod("drag" as any, 0);
    }).toThrowError();
  });
});
