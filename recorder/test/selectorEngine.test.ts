import { Browser, Page } from "playwright";
import { buildSelectorForCues } from "../src/selectorEngine";
import { QAWolfWeb } from "../src";
import { launch, TEST_URL } from "./utils";

describe("browser tests", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await launch();
    const context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(() => browser.close());

  beforeEach(async () => {
    await page.goto(`${TEST_URL}checkbox-inputs`);
  });

  describe("isMatch", () => {
    const isMatch = async (
      selector: string,
      targetSelector: string
    ): Promise<boolean> => {
      return page.evaluate(
        ({ selector, targetSelector }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const target = document.querySelector(targetSelector) as HTMLElement;
          return qawolf.isMatch(selector, target);
        },
        { selector, targetSelector }
      );
    };

    it("returns true if selector matches element", async () => {
      const result = await isMatch('[data-qa="html-checkbox"]', "#single");
      expect(result).toBe(true);

      const result2 = await isMatch("text=Single checkbox", '[for="single"]');
      expect(result2).toBe(true);
    });

    it("return false if selector does not match element", async () => {
      const result = await isMatch("#cat", "#single");
      expect(result).toBe(false);
    });

    it("handles strange quotes in text selector", async () => {
      await page.goto(`${TEST_URL}buttons`);

      const result = await isMatch(
        'text="Button \\"with\\" extra \'quotes\'"',
        ".quote-button"
      );
      expect(result).toBe(true);

      await page.goto(`${TEST_URL}checkbox-inputs`);
    });
  });

  describe("buildElementText", () => {
    const expectText = async (
      elementText: string,
      expectedText: string | undefined
    ) => {
      await page.setContent(`
        <html>
          <body>
            <header>${elementText}</header>
          </body>
        </html>
      `);
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

    it("returns selector", async () => {
      await expectText("leaves", "leaves");
    });

    it("returns undefined if selector would be empty string", async () => {
      await expectText("", undefined);
    });

    it("returns undefined if selector would be only whitespace", async () => {
      await expectText("&nbsp", undefined);
    });

    it("returns undefined for long text", async () => {
      await expectText("a".repeat(101), undefined);
    });

    it("trims whitespace", async () => {
      await expectText("\n hello world \n", "hello world");
    });
  });
});

describe("buildSelectorForCues", () => {
  it("builds selector from cues", () => {
    const cues = [
      { level: 0, penalty: 0, type: "class", value: ".search-input" },
      {
        level: 1,
        penalty: 0,
        type: "attribute",
        value: '[data-qa="search"]',
      },
      { level: 0, penalty: 0, type: "tag", value: "input" },
      { level: 0, penalty: 0, type: "id", value: "#search" },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual('[data-qa="search"] input.search-input#search');
  });

  it("includes text selector if applicable", () => {
    const cues = [
      { level: 1, penalty: 0, type: "id", value: "#container" },
      {
        level: 0,
        penalty: 0,
        type: "text",
        value: '"Submit"',
      },
    ];

    const selector = buildSelectorForCues(cues);
    expect(selector).toEqual('css=#container >> text="Submit"');
  });

  it("orders selectors based on level", () => {
    const cues = [
      { level: 0, penalty: 0, type: "id", value: "#search" },
      // check sort is not alphabetical
      { level: 10, penalty: 0, type: "tag", value: "nav" },
      { level: 2, penalty: 0, type: "class", value: ".search-input" },
    ];

    const selector = buildSelectorForCues(cues);

    expect(selector).toEqual("nav .search-input #search");
  });
});
