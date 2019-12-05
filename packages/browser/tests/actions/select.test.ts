import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { select } from "../../src/actions";

let browser: Browser;

describe("select", () => {
  beforeAll(async () => {
    browser = await Browser.create({
      url: `${CONFIG.testUrl}dropdown`
    });
  });

  afterAll(() => browser.close());

  it("selects option", async () => {
    const page = await browser.currentPage();

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue).toBeFalsy();

    const element = await browser.find({ css: "#dropdown" });
    await select(element, "2");

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue2).toBe("2");
  });

  it("throws error if option with value not available before timeout", async () => {
    const element = await browser.find({ css: "#dropdown" });

    const testFn = async () => await select(element, "3", 2000);
    await expect(testFn()).rejects.toThrowError();
  });

  it("throws error if option with value available but disabled before timeout", async () => {
    const element = await browser.find({ css: "#dropdown" });

    const testFn = async () => await select(element, "", 2000);
    await expect(testFn()).rejects.toThrowError();
  });
});
