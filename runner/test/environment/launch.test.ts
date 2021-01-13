import { launch } from "../../src/environment/launch";

describe("launch", () => {
  it("launches a browser and context", async () => {
    const { context, browser } = await launch({ headless: true });

    expect(browser.newContext).toBeTruthy();
    expect(context.newPage).toBeTruthy();

    await browser.close();
  });
});
