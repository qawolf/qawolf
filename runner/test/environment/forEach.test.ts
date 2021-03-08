import waitUntil from "async-wait-until";
import { Page } from "playwright";

import { forEachPage } from "../../src/environment/forEach";
import { launch } from "../../src/environment/launch";

describe("forEachPage", () => {
  it("runs for existing and new pages", async () => {
    const { browser, context } = await launch({ headless: true });

    const existingPage = await context.newPage();

    let index = 0;
    await forEachPage(context, (page: Page) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      page.evaluate(
        (index: number) => ((window as any).index = index),
        index++
      );
    });

    const newPage = await context.newPage();

    await waitUntil(() => context.pages().length > 1);

    const result = await Promise.all(
      [existingPage, newPage].map((page) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        page.evaluate(() => (window as any).index)
      )
    );
    expect(result).toEqual([0, 1]);

    await browser.close();
  });
});
