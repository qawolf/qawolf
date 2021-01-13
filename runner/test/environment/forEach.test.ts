import waitUntil from "async-wait-until";
import { Page } from "playwright";

import { forEachFrame, forEachPage } from "../../src/environment/forEach";
import { launch } from "../../src/environment/launch";
import { TEST_URL } from "../utils";

it("runs for existing and new frames", async () => {
  const { browser, context } = await launch({ headless: true });

  const page = await context.newPage();
  await page.goto(`${TEST_URL}iframes`);

  const titles: string[] = [];

  await forEachFrame(context, async ({ frame }) => {
    if (frame.parentFrame()) {
      const element = await frame.frameElement();
      const title = (await element.getAttribute("title")) || "";
      titles.push(title);
      titles.sort();
    }
  });

  expect(titles).toEqual(["Buttons", "Text inputs"]);
  await page.goto(`${TEST_URL}iframes`);
  await waitUntil(() => titles.length === 4);
  expect(titles).toEqual(["Buttons", "Buttons", "Text inputs", "Text inputs"]);

  await browser.close();
});

it("runs for existing and new pages", async () => {
  const { browser, context } = await launch({ headless: true });

  const existingPage = await context.newPage();

  let index = 0;
  await forEachPage(context, (page: Page) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    page.evaluate((index: number) => ((window as any).index = index), index++);
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
