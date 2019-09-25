import { Page } from "puppeteer";
import { createPage } from "../browser/browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";
import { computeSimilarityScores } from "./rank";

const step = {
  locator: {
    xpath: "xpath"
  },
  sourceEventId: 11,
  type: "click" as "click"
};

const base = {
  classList: ["spirit", "bobcat", "moose"],
  href: null,
  id: "spirit",
  inputType: "submit",
  labels: null,
  name: null,
  parentText: ["some text", "even more text"],
  placeholder: null,
  tagName: "input",
  textContent: "click me!"
};

let page: Page;

beforeAll(async () => {
  page = await createPage();
});

afterAll(() => page.browser().close());

describe("rank.computeScoresForElements", () => {
  test("returns scores for each element", async () => {
    const stepWithLocator = {
      ...step,
      locator: { ...base, tagName: "input" }
    };

    await page.goto(`${CONFIG.testUrl}/login`);

    const scores = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.computeSimilarityScores(
        step,
        document.getElementsByTagName("input")
      );
    }, stepWithLocator);

    expect(scores).toEqual([100, 100]);
  });

  test("throws error if step does not have locator", async () => {
    await page.goto(`${CONFIG.testUrl}/login`);

    const step = {
      locator: {
        xpath: "xpath"
      },
      sourceEventId: 11,
      type: "click" as "click"
    };

    expect(() => {
      computeSimilarityScores(step, new HTMLCollection());
    }).toThrowError();
  });
});

describe("rank.findCandidateElements", () => {
  test("returns all elements for click step", async () => {
    await page.goto(`${CONFIG.testUrl}/login`);

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findCandidateElements(step).length;
    }, step);

    expect(numElements).toBe(45);
  });

  test("returns only inputs for type step", async () => {
    await page.goto(`${CONFIG.testUrl}/login`);

    const typeAction = {
      ...step,
      type: "type" as "type",
      value: "spirit"
    };

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.rank.findCandidateElements(step).length;
    }, typeAction);

    expect(numElements).toBe(2);
  });
});

describe("rank.findTopElement", () => {
  test("returns null if no elements similar enough", async () => {
    await page.goto(`${CONFIG.testUrl}/login`);

    const stepWithLocator = {
      ...step,
      locator: base
    };

    const highestMatch = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findTopElement(step);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns null if a tie is found", async () => {
    await page.goto(`${CONFIG.testUrl}/checkboxes`);

    const stepWithLocator = {
      ...step,
      locator: {
        ...base,
        classList: null,
        id: null,
        inputType: "checkbox",
        textContent: null
      },
      type: "type"
    };

    const highestMatch = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findTopElement(step);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns xpath of highest match if one found", async () => {
    await page.goto(`${CONFIG.testUrl}/login`);

    const stepWithLocator = {
      ...step,
      locator: {
        ...base,
        classList: null,
        id: null,
        inputType: "password",
        labels: ["password"],
        textContent: null
      },
      type: "type"
    };

    const highestMatch = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;
      const element = qawolf.rank.findTopElement(step);
      return qawolf.xpath.getXpath(element!);
    }, stepWithLocator);

    expect(highestMatch).toBe("//*[@id='password']");
  });
});
