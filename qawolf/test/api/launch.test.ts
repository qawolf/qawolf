import { platform } from "os";
import playwright from "playwright";
import {
  getBrowserType,
  getLaunchOptions,
  parseBrowserName,
} from "../../src/api/launch";

describe("parseBrowserName", () => {
  it("returns firefox", () => {
    const name = parseBrowserName("firefox");
    expect(name).toBe("firefox");
  });

  it("returns webkit", () => {
    const name = parseBrowserName("webkit");
    expect(name).toBe("webkit");
  });

  it("returns chromium", () => {
    const name = parseBrowserName("chromium");
    expect(name).toBe("chromium");
  });

  it("returns chromium for null", () => {
    const name = parseBrowserName(null);
    expect(name).toBe("chromium");
  });

  it("returns chromium for undefined", () => {
    const name = parseBrowserName();
    expect(name).toBe("chromium");
  });

  it("returns chromium for foo", () => {
    const name = parseBrowserName("foo");
    expect(name).toBe("chromium");
  });
});

describe("getBrowserType", () => {
  afterEach(() => jest.resetModules());

  it("returns browser type from playwright if possible", () => {
    const browserType = getBrowserType("webkit");
    expect(browserType).toEqual(playwright.webkit);
  });

  it("returns browser type from flavored package", () => {
    jest.mock("playwright", () => {
      throw new Error("Cannot find module 'playwright'");
    });

    const browserType = getBrowserType("webkit");
    expect(typeof browserType.launch).toEqual("function");
  });

  it("throws an error if cannot import browser type", () => {
    jest.mock("playwright", () => {
      throw new Error("Cannot find module 'playwright'");
    });

    jest.mock("playwright-webkit", () => {
      throw new Error("Cannot find module 'playwright-webkit'");
    });

    expect(() => getBrowserType("webkit")).toThrowError(
      "qawolf requires playwright to be installed"
    );
  });
});

describe("getLaunchOptions", () => {
  it("on linux chromium, defaults --no-sandbox when no args are provided", () => {
    if (platform() !== "linux") return;

    expect(getLaunchOptions("chromium").args).toEqual(["--no-sandbox"]);
    expect(getLaunchOptions("chromium", { args: [] }).args).toEqual([]);
    expect(getLaunchOptions("webkit").args).toEqual([]);
  });
});
