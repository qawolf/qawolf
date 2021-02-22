import { Browser, Page } from "playwright";
import { QAWolfWeb } from "../src";
import { Cue } from "../src/cues";
import { DEFAULT_ATTRIBUTE_LIST, launch, TEST_URL } from "./utils";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch();
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto(`${TEST_URL}checkbox-inputs`);
});

afterAll(() => browser.close());

describe("buildCues", () => {
  const buildCues = async (selector: string): Promise<Cue[]> => {
    return page.evaluate(
      ({ attributes, selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const target = document.querySelector(selector) as HTMLElement;
        const cueTypesConfig = qawolf.getCueTypesConfig(attributes);

        return qawolf.buildCues({
          cueTypesConfig,
          isClick: true,
          target,
        });
      },
      { attributes: DEFAULT_ATTRIBUTE_LIST.split(","), selector }
    );
  };

  it("builds cues for a target", async () => {
    const cues = await buildCues("#single");
    expect(cues).toMatchSnapshot();
  });
});

describe("buildCuesForElement", () => {
  const buildCuesForElement = async (
    selector: string,
    level = 1
  ): Promise<Cue[]> => {
    return page.evaluate(
      ({ level, selector }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;
        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return [];

        const cueTypesConfig = qawolf.getCueTypesConfig(["data-qa"]);
        return qawolf.buildCuesForElement({
          cueTypesConfig,
          element,
          isClick: true,
          level,
        });
      },
      {
        level,
        selector,
      }
    );
  };

  it("builds cues for an element", async () => {
    const cues = await buildCuesForElement("#single");
    expect(cues).toEqual([
      { level: 1, penalty: 5, type: "id", value: "#single" },
      { level: 1, penalty: 40, type: "tag", value: "input" },
      {
        level: 1,
        penalty: 0,
        type: "attribute",
        value: '[data-qa="html-checkbox"]',
      },
    ]);

    const cues2 = await buildCuesForElement('[for="single"]');
    expect(cues2).toEqual([
      { level: 1, penalty: 5, type: "attribute", value: '[for="single"]' },
      { level: 1, penalty: 40, type: "tag", value: "label" },
    ]);

    const cues3 = await buildCuesForElement("#special\\:id");
    expect(cues3).toEqual([
      {
        level: 1,
        penalty: 12,
        type: "class",
        value: ".special\\:class",
      },
      {
        level: 1,
        penalty: 5,
        type: "id",
        value: "#special\\:id",
      },
      {
        level: 1,
        penalty: 40,
        type: "tag",
        value: "input:nth-of-type(2)",
      },
    ]);
  });

  it("builds text cues for level 0 only", async () => {
    const cues = await buildCuesForElement('[for="single"]', 0);
    expect(cues).toEqual([
      { level: 0, penalty: 5, type: "attribute", value: '[for="single"]' },
      { level: 0, penalty: 40, type: "tag", value: "label" },
      { level: 0, penalty: 10, type: "text", value: "Single checkbox" },
    ]);

    const cues2 = await buildCuesForElement('[for="single"]', 1);
    expect(cues2).toEqual([
      { level: 1, penalty: 5, type: "attribute", value: '[for="single"]' },
      { level: 1, penalty: 40, type: "tag", value: "label" },
    ]);
  });

  it("ignores dynamic attr values when building cues", async () => {
    const cues = await buildCuesForElement('[name="bu32879fDi"]');
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "penalty": 40,
          "type": "tag",
          "value": "input:nth-of-type(4)",
        },
      ]
    `);
  });

  it("ignores empty attr values when building cues", async () => {
    const cues = await buildCuesForElement("#y908drgun4");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "penalty": 40,
          "type": "tag",
          "value": "input:nth-of-type(8)",
        },
      ]
    `);
  });

  it("ignores empty text values when building cues", async () => {
    await page.setContent(`
      <html>
        <body>
          <header>&nbsp;</header>
        </body>
      </html>
    `);
    const cues = await buildCuesForElement("header");
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "penalty": 40,
          "type": "tag",
          "value": "header",
        },
      ]
    `);
    await page.goto(`${TEST_URL}checkbox-inputs`);
  });

  it("uses non-dynamic attr values when building cues", async () => {
    const cues = await buildCuesForElement('[name="nonDynamicInput"]');
    expect(cues).toMatchInlineSnapshot(`
      Array [
        Object {
          "level": 1,
          "penalty": 10,
          "type": "attribute",
          "value": "[name=\\"nonDynamicInput\\"]",
        },
        Object {
          "level": 1,
          "penalty": 40,
          "type": "tag",
          "value": "input:nth-of-type(3)",
        },
      ]
    `);
  });
});

describe("buildCueValueForTag", () => {
  const buildCueValueForTag = async (selector: string): Promise<string> => {
    return page.evaluate((selector) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const element = document.querySelector(selector) as HTMLElement;

      return element
        ? qawolf.buildCueValueForTag(element)
        : "ELEMENT NOT FOUND";
    }, selector);
  };

  it("returns tag name if no parent element", async () => {
    const value = await buildCueValueForTag("html");
    expect(value).toBe("html");
  });

  it("returns tag name if element has no siblings", async () => {
    const value = await buildCueValueForTag(".container h3");
    expect(value).toBe("h3");
  });

  it("returns tag name if element is first child", async () => {
    const value = await buildCueValueForTag('[for="single"]');
    expect(value).toBe("label");
  });

  it("returns nth-of-type tag if element is a lower sibling", async () => {
    const value = await buildCueValueForTag('[for="special\\:id"]');
    expect(value).toBe("label:nth-of-type(2)");
  });
});
