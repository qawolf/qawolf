import { formatLaunch } from "../src/formatLaunch";

describe("formatLaunch", () => {
  it("includes device if present", () => {
    expect(formatLaunch("https://google.com", "iPhone 7")).toEqual(
      `await launch({ device: "iPhone 7", url: "https://google.com" });`
    );
  });

  it("includes url", () => {
    expect(formatLaunch("https://google.com")).toEqual(
      `await launch({ url: "https://google.com" });`
    );
  });
});
