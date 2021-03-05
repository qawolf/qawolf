import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { CueSet } from "../src/types";
import { launch, LaunchResult } from "./utils";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

describe("generateSortedCueSets", () => {
  let cueSets: CueSet[];

  const generateSortedCueSets = async (selector: string): Promise<CueSet[]> =>
    page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLElement;
        const cueSets = qawolf.generateSortedCueSets(target);
        return [...cueSets];
      },
      { selector }
    );

  beforeAll(async () => {
    await page.setContent(`
    <html>
      <body>
        <div data-test="parent"><a data-test="target" href="link"><span data-test="child"></span></a></div>
      </body>
    </html>
    `);

    cueSets = await generateSortedCueSets('[data-test="target"]');
  });

  it("generates target cue sets", async () => {
    const values = cueSets
      .map((set) => set.cues)
      .filter((s) => !s.some((c) => c.level !== 0))
      .map((s) => s.map((c) => c.value).join(" "))
      .sort((a, b) => a.length - b.length);

    expect(values).toEqual([
      "a",
      '[href="link"]',
      'a [href="link"]',
      '[data-test="target"]',
      'a [data-test="target"]',
      '[data-test="target"] [href="link"]',
      'a [data-test="target"] [href="link"]',
    ]);
  });

  it("generates target and relative cue sets", async () => {
    const values = cueSets
      .map((set) => set.cues)
      // choose the descendant cues
      .filter((s) => s.some((c) => c.level > 0))
      .map((s) => s.map((c) => c.value).join(" "))
      .sort((a, b) => a.length - b.length);

    expect(values).toEqual([
      "span a",
      'span [href="link"]',
      'span a [href="link"]',
      '[data-test="child"] a',
      'span [data-test="target"]',
      'span [data-test="child"] a',
      'span a [data-test="target"]',
      '[data-test="child"] [href="link"]',
      '[data-test="child"] a [href="link"]',
      'span [data-test="child"] [href="link"]',
      'span [data-test="target"] [href="link"]',
      '[data-test="child"] [data-test="target"]',
      '[data-test="child"] a [data-test="target"]',
      'span [data-test="child"] [data-test="target"]',
      '[data-test="child"] [data-test="target"] [href="link"]',
    ]);
  });
});
