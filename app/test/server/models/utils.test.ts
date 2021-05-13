import { buildColor } from "../../../server/models/utils";

describe("buildColor", () => {
  const colors = ["red", "blue", "green"];

  it("returns the first unused color if possible", () => {
    expect(buildColor([], colors)).toBe("red");
    expect(buildColor(["blue"], colors)).toBe("red");

    expect(buildColor(["red"], colors)).toBe("blue");
    expect(buildColor(["red", "blue", "blue"], colors)).toBe("green");
  });

  it("returns the next color otherwise", () => {
    expect(buildColor(["red", "blue", "green"], colors)).toBe("red");

    expect(buildColor(["red", "blue", "green", "red"], colors)).toBe("blue");
  });
});
