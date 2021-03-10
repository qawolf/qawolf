import { getBrowserLaunchOptions, launch } from "../../src/environment/launch";

describe("getBrowserLaunchOptions", () => {
  it("defaults headless to false", () => {
    expect(getBrowserLaunchOptions("chromium", {})).toMatchObject({
      headless: false,
    });

    expect(
      getBrowserLaunchOptions("chromium", { headless: true })
    ).toMatchObject({
      headless: true,
    });
  });

  it("includes default args for chrome and chromium", () => {
    const args = [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--window-position=0,0",
    ];

    expect(getBrowserLaunchOptions("chrome", {})).toMatchObject({ args });

    expect(
      getBrowserLaunchOptions("chromium", { headless: true })
    ).toMatchObject({ args });
  });

  it("sets executablePath for chrome", () => {
    expect(getBrowserLaunchOptions("chrome", {})).toMatchObject({
      executablePath: "/opt/google/chrome/chrome",
    });
  });
});

describe("launch", () => {
  it("launches a browser and context", async () => {
    const { context, browser } = await launch({ headless: true });

    expect(browser.newContext).toBeTruthy();
    expect(context.newPage).toBeTruthy();

    await browser.close();
  });
});
