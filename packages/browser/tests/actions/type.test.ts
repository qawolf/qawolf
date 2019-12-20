import { CONFIG } from "@qawolf/config";
import { Browser, launch, Page } from "../../src";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({
    url: `${CONFIG.testUrl}login`
  });

  page = await browser.page();
});

afterAll(() => browser.close());

describe("Browser.type", () => {
  it("sets input value", async () => {
    await browser.type({ css: "#username" }, "spirit");

    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );
    expect(username).toBe("spirit");
  });
});

describe("Page.type", () => {
  it("does not clear input value for Tab (or Enter)", async () => {
    await page.qawolf.type({ css: "#username" }, "↓Tab↑Tab");

    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );
    expect(username).toEqual("spirit");
  });

  it("does not clear input value when skipClear = true", async () => {
    await browser.type({ css: "#username" }, "2", { skipClear: true });

    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );

    expect(username).toEqual("spirit2");
  });

  it("clears input value for null", async () => {
    await page.qawolf.type({ css: "#username" }, null);

    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );
    expect(username).toBeFalsy();
  });
});
