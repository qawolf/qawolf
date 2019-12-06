import { CONFIG } from "@qawolf/config";
import { launch } from "../../src/browser/launch";

describe("Browser.page", () => {
  it("chooses the first open page if the current page is closed", async () => {
    const browser = await launch({ url: CONFIG.testUrl });

    const pageOne = await browser.newPage();

    // change the current page to 1
    await browser.page(1);
    let currentPage = await browser.page();
    expect(currentPage).toEqual(pageOne);

    await pageOne.close();

    currentPage = await browser.page();
    expect(currentPage).not.toEqual(pageOne);

    await browser.close();
  });
});

describe("Browser.find", () => {
  it("finds an element", async () => {
    const browser = await launch({ url: `${CONFIG.testUrl}login` });

    const elementHandle = await browser.find({ css: "#login > button" });
    expect(elementHandle).toBeTruthy();
    expect(
      await elementHandle!.evaluate(e => (e as HTMLButtonElement).type)
    ).toBe("submit");

    await browser.close();
  });
});
