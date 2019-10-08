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
    const page = await browser.goto(`${CONFIG.testUrl}login`);

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

      return qawolf.rank.computeSimilarityScores(step, elements, null);
    }, stepWithLocator);

    expect(scores).toEqual([100, 100]);
  });
});

describe("rank.findCandidateElements", () => {
  test("returns all elements for click step", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findCandidateElements(step).length;
    }, step);

    expect(numElements).toBe(28);
  });

  test('returns inputs for "type" step', async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const typeAction = {
      action: "input" as "input",
      ...step,
      value: "spirit"
    };

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.rank.findCandidateElements(step).length;
    }, typeAction);

    expect(numElements).toBe(2);
  });

  test('returns select for "type" step', async () => {
    const page = await browser.goto(`${CONFIG.testUrl}/dropdown`);

    const typeAction = {
      action: "input" as "input",
      ...step,
      value: "spirit"
    };

    const numElements = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.rank.findCandidateElements(step).length;
    }, typeAction);

    expect(numElements).toBe(1);
  });
});

describe("rank.findElementByDataValue", () => {
  test("returns null if no elements found", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const element = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const element = qawolf.rank.findElementByDataValue("data-qa", "user");

      return element;
    });

    expect(element).toBeNull();
  });

  test("returns element if one found", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const elementId = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "user");

      const element = qawolf.rank.findElementByDataValue("data-qa", "user")!;

      return element.id;
    });

    expect(elementId).toBe("username");
  });

  test("throws error if multiple elements with same data value found", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const throws = async () => {
      return page.evaluate(() => {
        const qawolf: QAWolf = (window as any).qawolf;

        const username = document.getElementById("username")!;
        username.setAttribute("data-qa", "user");
        const password = document.getElementById("password")!;
        password.setAttribute("data-qa", "user");

        return qawolf.rank.findElementByDataValue("data-qa", "user");
      });
    };

    await expect(throws()).rejects.toThrowError();
  });
});

describe("rank.findTopElement", () => {
  test("returns null if no elements similar enough", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

    const stepWithLocator = {
      ...step,
      locator: base
    };

    const highestMatch = await page.evaluate(step => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.rank.findTopElement(step, null);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns null if a tie is found", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}checkboxes`);

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

      return qawolf.rank.findTopElement(step, null);
    }, stepWithLocator);

    expect(highestMatch).toBeNull();
  });

  test("returns xpath of highest match if one found", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}login`);

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
      const element = qawolf.rank.findTopElement(step, null);
      return qawolf.xpath.getXpath(element!);
    }, stepWithLocator);

    expect(highestMatch).toBe("//*[@id='password']");
  });

  describe("rank.waitForElement", () => {
    test("returns element based on data attribute if one provided", async () => {
      const page = await browser.goto(`${CONFIG.testUrl}login`);

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

      const foundElement = await page.evaluate(step => {
        const qawolf: QAWolf = (window as any).qawolf;

        return qawolf.rank.waitForElement(step, null).then(element => {
          return qawolf.xpath.getXpath(element!);
        });
      }, stepWithLocator);

      expect(foundElement).toBe("//*[@id='password']");
    });

    test("returns closest match element if no data attribute provided", async () => {
      const page = await browser.goto(`${CONFIG.testUrl}login`);

      const stepWithLocator = {
        ...step,
        locator: {
          ...base,
          classList: null,
          dataValue: "password",
          id: null,
          inputType: "text",
          labels: null,
          textContent: null
        },
        type: "type"
      };

      const foundElement = await page.evaluate(step => {
        const qawolf: QAWolf = (window as any).qawolf;
        const password = document.getElementById("password")!;
        password.setAttribute("data-qa", "password");

        return qawolf.rank.waitForElement(step, "data-qa").then(element => {
          password.removeAttribute("data-qa");
          return qawolf.xpath.getXpath(element!);
        });
      }, stepWithLocator);

      expect(foundElement).toBe("//*[@id='password']");
    });

    test("throws error if data attribute provided and no element found", async () => {
      const page = await browser.goto(`${CONFIG.testUrl}login`);

      const stepWithLocator = {
        ...step,
        locator: {
          ...base,
          classList: null,
          dataValue: "password",
          id: null,
          inputType: "password",
          labels: ["password"],
          textContent: null
        },
        type: "type"
      };

      const throws = async () => {
        return page.evaluate(step => {
          const qawolf: QAWolf = (window as any).qawolf;

          return qawolf.rank
            .waitForElement(step, "data-qa", 2000)
            .then(element => {
              return qawolf.xpath.getXpath(element!);
            });
        }, stepWithLocator);
      };

      await expect(throws()).rejects.toThrowError();
    });
  });
});
