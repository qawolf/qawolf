import { CONFIG } from "@qawolf/config";
import { selectElementContent } from "../../src/actions";
import { launch } from "../../src/context/launch";
import { BrowserContext, Page } from "../../src";

describe("selectElementContent", () => {
  let context: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    context = await launch();
    page = await context.page();
  });

  afterAll(() => context.close());

  it("selects content editable content", async () => {
    await context.goto(`${CONFIG.sandboxUrl}content-editables`);

    expect(
      await page.evaluate(() => document.getSelection()!.anchorNode)
    ).toEqual(null);

    const element = await context.find({ css: '[data-qa="content-editable"]' });
    await selectElementContent(element);

    expect(
      await page.evaluate(() =>
        (document.getSelection()!.anchorNode as Element).getAttribute("data-qa")
      )
    ).toEqual("content-editable");
  });

  it("selects text input content", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    expect(
      await page.evaluate(() => document.getSelection()!.anchorNode)
    ).toEqual(null);

    const element = await context.find({
      css: '[data-qa="html-text-input-filled"]'
    });
    await selectElementContent(element);

    expect(
      await element.evaluate(
        (e: HTMLInputElement) => e.selectionEnd === e.value.length
      )
    ).toBeTruthy();
  });

  it("focuses date inputs", async () => {
    await context.goto(`${CONFIG.sandboxUrl}date-pickers`);

    const element = await context.find({ css: '[data-qa="html-date-picker"]' });

    expect(
      await page.evaluate(() => document.activeElement!.getAttribute("data-qa"))
    ).toBeNull();

    await selectElementContent(element);

    expect(
      await page.evaluate(() => document.activeElement!.getAttribute("data-qa"))
    ).toEqual("html-date-picker");
  });
});
