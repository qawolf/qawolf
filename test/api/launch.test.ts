import { platform } from "os";
import { getLaunchOptions, parseBrowserName } from "../../src/api/launch";

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

  it("returns chrome for null", () => {
    const name = parseBrowserName(null);
    expect(name).toBe("chrome");
  });

  it("returns chrome for undefined", () => {
    const name = parseBrowserName();
    expect(name).toBe("chrome");
  });

  it("returns chrome for foo", () => {
    const name = parseBrowserName("foo");
    expect(name).toBe("chrome");
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
