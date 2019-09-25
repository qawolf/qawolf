import { BrowserObject } from "webdriverio";
import { createBrowser, injectClient } from "../browser/browserUtils";
import { CONFIG } from "../config";
import { computeSimilarityScores } from "./rank";
import { QAWolf } from "./index";

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

let browser: BrowserObject;

beforeAll(async () => {
  browser = await createBrowser();
});

afterAll(() => browser.closeWindow());

const goToInjectClient = async (url: string) => {
  await browser.url(url);
  await injectClient(browser);
};

describe("rank.computeScoresForElements", () => {
  test("returns scores for each element", async () => {
    const stepWithLocator = {
      ...step,
      locator: { ...base, tagName: "input" }
    };

    await goToInjectClient(`${CONFIG.testUrl}/login`);

    const scores = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.computeSimilarityScores(
        step,
        document.getElementsByTagName("input")
      );
    }, stepWithLocator);

    expect(scores).toEqual([100, 100]);
  });

  test("throws error if step does not have locator", async () => {
    await goToInjectClient(`${CONFIG.testUrl}/login`);

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
    await goToInjectClient(`${CONFIG.testUrl}/login`);

    const elements = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findCandidateElements(step);
    }, step);

    expect(elements.length).toBe(45);
  });

  test("returns only inputs for type step", async () => {
    await goToInjectClient(`${CONFIG.testUrl}/login`);

    const typeAction = {
      ...step,
      type: "type" as "type",
      value: "spirit"
    };

    const elements = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findCandidateElements(step);
    }, typeAction);

    expect(elements.length).toBe(2);
  });
});

describe("rank.findTopElement", () => {
  test("returns null if no elements similar enough", async () => {
    await goToInjectClient(`${CONFIG.testUrl}/login`);

    const stepWithLocator = {
      ...step,
      locator: base
    };

    const highestMatch = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findTopElement(step);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns null if a tie is found", async () => {
    await goToInjectClient(`${CONFIG.testUrl}/checkboxes`);

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

    const highestMatch = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findTopElement(step);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns xpath of highest match if one found", async () => {
    await goToInjectClient(`${CONFIG.testUrl}/login`);

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

    const highestMatch = await browser.execute(step => {
      const qawolf: QAWolf = (window as any).qawolf;
      const element = qawolf.rank.findTopElement(step);
      return qawolf.xpath.getXpath(element!);
    }, stepWithLocator);

    expect(highestMatch).toBe("//*[@id='password']");
  });
});
