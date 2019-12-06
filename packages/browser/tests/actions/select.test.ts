import { CONFIG } from "@qawolf/config";
import { Browser, launch } from "../../src";
import { selectElement } from "../../src/actions/select";

let browser: Browser;

describe("selectElement", () => {
  beforeAll(async () => {
    browser = await launch({
      url: `${CONFIG.testUrl}dropdown`
    });
  });

  afterAll(() => browser.close());

  it("selects option", async () => {
    const page = await browser.page();

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue).toBeFalsy();

    const element = await browser.find({ css: "#dropdown" });
    await selectElement(element, "2");

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue2).toBe("2");
  });

  it("throws error if option with value not available before timeout", async () => {
    const element = await browser.find({ css: "#dropdown" });

    const testFn = async () =>
      await selectElement(element, "3", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });

  it("throws error if option with value available but disabled before timeout", async () => {
    const element = await browser.find({ css: "#dropdown" });

    const testFn = async () =>
      await selectElement(element, "", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });
});
