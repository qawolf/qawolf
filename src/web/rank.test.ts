import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

const step = {
  locator: {
    xpath: "xpath"
  },
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

let browser: Browser;

beforeAll(async () => {
  browser = await Browser.create();
});

afterAll(() => browser.close());

describe("rank.computeScoresForElements", () => {
  test("returns scores for each element", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}/login`);

    const stepWithLocator = {
      ...step,
      locator: { ...base, tagName: "input" }
    };

    const scores = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.getElementsByTagName("input");
      const elements = [];
      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i]);
      }

      return qawolf.rank.computeSimilarityScores(step, elements);
    }, stepWithLocator);

    expect(scores).toEqual([100, 100]);
  });
});

describe("rank.findCandidateElements", () => {
  test("returns all elements for click step", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}/login`);

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findCandidateElements(step).length;
    }, step);

    expect(numElements).toBe(28);
  });

  test("returns only inputs for type step", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}/login`);

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
    const page = await browser.goto(`${CONFIG.testUrl}/login`);

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
    const page = await browser.goto(`${CONFIG.testUrl}/checkboxes`);

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
    const page = await browser.goto(`${CONFIG.testUrl}/login`);

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
