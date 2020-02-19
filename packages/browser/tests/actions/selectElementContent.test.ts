import { CONFIG } from "@qawolf/config";
import { selectElementContent } from "../../src/actions";
import { BrowserContext, launch, Page } from "../../src";

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

    const getSelectionAttribute = () =>
      page.evaluate(() => {
        const selection = document.getSelection();
        if (!selection || !selection.anchorNode) return null;

        const node = selection.anchorNode as Element;

        // for webkit
        const element = node.getAttribute
          ? (node as Element)
          : node.parentElement!;

        return element.getAttribute("data-qa");
      });

    expect(await getSelectionAttribute()).toBeNull();

    const element = await context.find({ css: '[data-qa="content-editable"]' });
    await selectElementContent(element);

    expect(await getSelectionAttribute()).toEqual("content-editable");
  });

  it("selects text input content", async () => {
    await context.goto(`${CONFIG.sandboxUrl}text-inputs`);

    const element = await context.find({
      css: '[data-qa="html-text-input-filled"]'
    });

    const getSelection = () =>
      element.evaluate((e: HTMLInputElement) => ({
        start: e.selectionStart,
        end: e.selectionEnd
      }));

    expect(await getSelection()).toEqual({ start: 12, end: 12 });

    await selectElementContent(element);

    expect(await getSelection()).toEqual({ start: 0, end: 12 });
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
