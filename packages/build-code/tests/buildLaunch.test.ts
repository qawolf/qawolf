import { buildLaunch } from "../src/buildLaunch";

describe("buildLaunch", () => {
  it("includes device if present", () => {
    expect(buildLaunch("https://google.com", "iPhone 7")).toEqual(
      `await launch({ device: "iPhone 7", url: "https://google.com" });`
    );
  });

  it("includes url", () => {
    expect(buildLaunch("https://google.com")).toEqual(
      `await launch({ url: "https://google.com" });`
    );
  });
});
