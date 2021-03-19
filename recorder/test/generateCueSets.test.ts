import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { CueSet } from "../src/types";
import { launch, LaunchResult, setBody } from "./utils";

let launched: LaunchResult;
let page: Page;

beforeAll(async () => {
  launched = await launch();
  page = launched.page;
});

afterAll(() => launched.browser.close());

describe("generateSortedCueSets", () => {
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

  it("does not send duplicate cue sets", async () => {
    await setBody(page, "<div><div></div></div>");

    const cueSets = await generateSortedCueSets("div div");
    expect(cueSets.map((c) => c.cues.map((c) => c.value).join(" "))).toEqual([
      "div",
      "body",
      "html",
      "div div",
      "body div",
      "html div",
      ":visible",
      "div :visible",
      "body :visible",
      "html :visible",
      "div div :visible",
      "body div :visible",
      "html div :visible",
    ]);
  });

  it("generates target cue sets", async () => {
    await setBody(
      page,
      `<div data-test="parent"><a data-test="target" href="link"><span data-test="child"></span></a></div>`
    );

    const cueSets = await generateSortedCueSets('[data-test="target"]');

    const values = cueSets
      .map((set) => set.cues)
      .filter((s) => !s.some((c) => c.level !== 0))
      .map((s) => s.map((c) => c.value).join(" "))
      .sort((a, b) => a.length - b.length);

    expect(values).toEqual([
      '[data-test="target"]',
      '[data-test="target"] a',
      '[data-test="target"] :visible',
      '[data-test="target"] a :visible',
      '[data-test="target"] [href="link"]',
      '[data-test="target"] a [href="link"]',
      '[data-test="target"] :visible [href="link"]',
      '[data-test="target"] a :visible [href="link"]',
    ]);
  });

  it("generates relative cue sets", async () => {
    await setBody(
      page,
      `<div data-test="parent"><a data-test="target" href="link"><span data-test="child"></span></a></div>`
    );

    const cueSets = await generateSortedCueSets('[data-test="target"]');

    const values = cueSets
      .map((set) => set.cues)
      // choose the descendant cues
      .filter((s) => s.some((c) => c.level > 0))
      .map((s) =>
        s
          .sort((a, b) => a.level - b.level)
          .map((c) => `${c.level}${c.value}`)
          .join(" ")
      )
      .sort((a, b) => a.length - b.length);

    expect(values).toEqual([
      '1[data-test="child"]',
      '0a 1[data-test="child"]',
      '1span 1[data-test="child"]',
      '0[data-test="target"] 1span',
      '0a 1span 1[data-test="child"]',
      '0[data-test="target"] 0a 1span',
      '0:visible 1[data-test="child"]',
      '0a 0:visible 1[data-test="child"]',
      '0[href="link"] 1[data-test="child"]',
      '0:visible 1span 1[data-test="child"]',
      '0[data-test="target"] 0:visible 1span',
      '0a 0[href="link"] 1[data-test="child"]',
      '0[data-test="target"] 0a 0:visible 1span',
      '0[href="link"] 1span 1[data-test="child"]',
      '0[data-test="target"] 1[data-test="child"]',
      '0[data-test="target"] 0[href="link"] 1span',
      '0a 0[data-test="target"] 1[data-test="child"]',
      '0[data-test="target"] 0a 0[href="link"] 1span',
      '0:visible 0[href="link"] 1[data-test="child"]',
      '0[data-test="target"] 1span 1[data-test="child"]',
      '0:visible 0[data-test="target"] 1[data-test="child"]',
      '0[data-test="target"] 0:visible 0[href="link"] 1span',
      '0[data-test="target"] 0[href="link"] 1[data-test="child"]',
    ]);
  });
});
