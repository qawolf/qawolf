import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch } from "../../src";
import { selectElement } from "../../src/actions";

let context: BrowserContext;

beforeAll(async () => {
  context = await launch();
});

afterAll(() => context.close());

describe("BrowserContext.select", () => {
  it("selects option", async () => {
    const page = await context.goto(`${CONFIG.testUrl}dropdown`);

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue).toBeFalsy();

    await page.qawolf().select({ css: "#dropdown" }, "2");

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue2).toBe("2");
  });
});

describe("Page.select", () => {
  it("clears option", async () => {
    const page = await context.page();

    await page.qawolf().select({ css: "#dropdown" }, null);

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue2).toBeFalsy();
  });
});

describe("selectElement", () => {
  it("throws error if option with value not available before timeout", async () => {
    const element = await context.find({ css: "#dropdown" });

    const testFn = async () =>
      await selectElement(element, "3", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });

  it("throws error if option with value available but disabled before timeout", async () => {
    const element = await context.find({ css: "#dropdown" });

    const testFn = async () =>
      await selectElement(element, "sup", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });
});
