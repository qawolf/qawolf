import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";

let context: BrowserContext;
let page: Page;

beforeAll(async () => {
  context = await launch();
  page = await context.page();
});

afterAll(() => context.close());

describe("content editable", () => {
  it("appends text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}content-editables`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="content-editable"]' }, " Ok!");

    let expected = "Edit me! Ok!";
    if (CONFIG.browser === "firefox") expected += "<br>";

    expect(await element.evaluate((e: HTMLElement) => e.innerHTML)).toBe(
      expected
    );
  });

  it("clears text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}content-editables`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="content-editable"]' }, "", { replace: true });

    const expected = CONFIG.browser === "chromium" ? "" : "<br>";
    expect(await element.evaluate((e: HTMLElement) => e.innerHTML)).toBe(
      expected
    );
  });

  it("replaces text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}content-editables`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="content-editable"]' }, "spirit", {
        replace: true
      });

    expect(await element.evaluate((e: HTMLElement) => e.innerHTML)).toBe(
      "spirit"
    );
  });
});

describe("input[type=date] ", () => {
  it("replaces the value", async () => {
    await context.goto(`${CONFIG.sandboxUrl}date-pickers`);

    const element = await page
      .qawolf()
      .type(
        { css: '[data-qa="material-date-picker-native"] input' },
        "09092020",
        { replace: true }
      );

    const expected = CONFIG.browser === "webkit" ? "09092020" : "2020-09-09";

    expect(await element.evaluate((e: HTMLInputElement) => e.value)).toBe(
      expected
    );
  });
});

describe("input[type=number] ", () => {
  it("sets value", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="html-number-input"]' }, "999");

    const value = await element.evaluate(
      (input: HTMLInputElement) => input.value
    );
    expect(value).toBe("999");
  });
});

describe("input[type=text]", () => {
  test("appends text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    // test context.type wrapper works
    let element = await context.type(
      { css: '[data-qa="html-text-input"]' },
      "spirit"
    );

    // select the middle to make sure we move the caret to the end
    await page.evaluate(() => {
      const element = document.querySelector(
        '[data-qa="html-text-input-filled"]'
      ) as HTMLInputElement;
      element.focus();
      element.setSelectionRange(3, 10);
    });

    element = await page
      .qawolf()
      .type({ css: '[data-qa="html-text-input-filled"]' }, " more");

    expect(await element.evaluate((e: HTMLInputElement) => e.value)).toBe(
      "initial text more"
    );
  });

  it("clears text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="html-text-input-filled"]' }, null, {
        replace: true
      });

    expect(await element.evaluate((e: HTMLInputElement) => e.value)).toBe("");
  });

  it("replaces text", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    const element = await page
      .qawolf()
      .type({ css: '[data-qa="html-text-input-filled"]' }, "spirit", {
        replace: true
      });

    expect(await element.evaluate((e: HTMLInputElement) => e.value)).toBe(
      "spirit"
    );
  });
});

describe("input[type=time]  ", () => {
  it("replaces the value", async () => {
    await context.goto(`${CONFIG.sandboxUrl}time-pickers`);

    const element = await page
      .qawolf()
      .type(
        { css: '[data-qa="material-time-picker-native"] input' },
        "0230PM",
        { replace: true }
      );

    const expected = CONFIG.browser === "webkit" ? "0230PM" : "14:30";
    expect(await element.evaluate((e: HTMLInputElement) => e.value)).toBe(
      expected
    );
  });
});
