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
    const page = await context.goto(`${CONFIG.sandboxUrl}selects`);

    const selectValue = await page.evaluate(() => {
      const select = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;
      return select.value;
    });
    expect(selectValue).toBeFalsy();

    await page.qawolf().select({ css: "[data-qa='html-select']" }, "hedgehog");

    const selectValue2 = await page.evaluate(() => {
      const select = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;
      return select.value;
    });
    expect(selectValue2).toBe("hedgehog");
  });
});

describe("Page.select", () => {
  it("clears option", async () => {
    const page = await context.page();

    await page.qawolf().select({ css: "[data-qa='html-select']" }, null);

    const selectValue2 = await page.evaluate(() => {
      const select = document.querySelector(
        "[data-qa='html-select']"
      ) as HTMLSelectElement;
      return select.value;
    });
    expect(selectValue2).toBeFalsy();
  });
});

describe("selectElement", () => {
  it("throws error if option with value not available before timeout", async () => {
    const element = await context.find({ css: "[data-qa='html-select']" });

    const testFn = async () =>
      await selectElement(element, "horse", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });

  it("throws error if option with value available but disabled before timeout", async () => {
    const element = await context.find({ css: "[data-qa='html-select']" });

    const testFn = async () =>
      await selectElement(element, "snake", { timeoutMs: 2000 });
    await expect(testFn()).rejects.toThrowError();
  });
});
