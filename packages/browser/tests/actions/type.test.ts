import { CONFIG } from "@qawolf/config";
import { Browser, launch } from "../../src";

let browser: Browser;

beforeAll(async () => {
  browser = await launch({
    url: `${CONFIG.testUrl}login`
  });
});

afterAll(() => browser.close());

describe("Browser.type", () => {
  it("sets input value", async () => {
    await browser.type({ css: "#username" }, "spirit");

    const page = await browser.page();
    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );
    expect(username).toBe("spirit");
  });
});

describe("Page.type", () => {
  it("clears input value", async () => {
    const page = await browser.page();
    await page.qawolf.type({ css: "#username" }, null);

    const username = await page.$eval(
      "#username",
      (input: HTMLInputElement) => input.value
    );
    expect(username).toBeFalsy();
  });
});
