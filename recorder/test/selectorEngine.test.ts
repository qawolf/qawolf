import { Browser, Page } from "playwright";

import { QAWolfWeb } from "../src";
import { buildSelectorForCues } from "../src/selectorEngine";
import { Cue } from "../src/types";
import { launch, setBody } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  const launched = await launch();
  browser = launched.browser;
  page = launched.page;
});

afterAll(() => browser.close());

describe("buildElementText", () => {
  const expectText = async (
    elementText: string,
    expectedText: string | undefined
  ) => {
    await setBody(page, `<header>${elementText}</header>`);

    const textSelector = await page.evaluate(
      ({ selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return null;

        return qawolf.buildElementText(element);
      },
      {
        selector: "header",
      }
    );
    expect(textSelector).toBe(expectedText);
  };

  it("replaces newlines", async () => {
    await expectText("hello \n world", "hello world");
  });

  it("returns selector", async () => {
    await expectText("leaves", "leaves");
  });

  it("returns an empty string", async () => {
    await expectText("", "");
  });

  it("returns an empty string if selector would be only whitespace", async () => {
    await expectText("&nbsp", "");
  });

  it("returns an empty string for long text", async () => {
    await expectText("a".repeat(101), "");
  });

  it("trims whitespace", async () => {
    await expectText("\n hello world \n", "hello world");
  });
});

describe("buildSelectorForCues", () => {
  it("builds selector from cues", () => {
    const cues: Cue[] = [
      { level: 0, penalty: 0, type: "class", value: ".search-input" },
      {
        level: 1,
        penalty: 0,
        type: "attribute",
        value: '[data-qa="search"]',
      },
      { level: 0, penalty: 0, type: "tag", value: "input" },
      { level: 0, penalty: 0, type: "modifier", value: ":visible" },
      { level: 0, penalty: 0, type: "id", value: "#search" },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual(
      'input.search-input#search:visible [data-qa="search"]'
    );
  });

  it("includes text selector if applicable", () => {
    const cues: Cue[] = [
      { level: 1, penalty: 0, type: "id", value: "#container" },
      {
        level: 0,
        penalty: 0,
        type: "text",
        value: '"Submit"',
      },
    ];

    const selector = buildSelectorForCues(cues);
    expect(selector).toEqual('text="Submit" >> #container');
  });

  it("orders selectors based on level", () => {
    const cues: Cue[] = [
      { level: 0, penalty: 0, type: "id", value: "#search" },
      // check sort is not alphabetical
      { level: 10, penalty: 0, type: "tag", value: "nav" },
      { level: 2, penalty: 0, type: "class", value: ".search-input" },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual("#search .search-input nav");
  });
});
