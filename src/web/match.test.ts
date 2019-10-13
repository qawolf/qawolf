import { Page } from "puppeteer";
import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";
import {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  countPresentKeys,
  Match
} from "./match";

describe("compareArrays", () => {
  test("returns 0 if either array is null", () => {
    expect(compareArrays(null, ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], null)).toBe(0);
  });

  test("returns 0 if either array is empty", () => {
    expect(compareArrays([], ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], [])).toBe(0);
  });

  test("returns the share of base items in compare", () => {
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "bear"])).toBe(50);
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "spirit"])).toBe(50);
  });
});

describe("compareDescriptorKey", () => {
  test("returns 0 if either value is falsy", () => {
    expect(compareDescriptorKey("id", null, "spirit")).toEqual({
      key: "id",
      percent: 0
    });
    expect(compareDescriptorKey("id", "spirit", null)).toEqual({
      key: "id",
      percent: 0
    });
  });

  test("returns 0 if different xpaths", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.match.compareDescriptorKey(
        "xpath",
        "//*[@id='username']",
        "//*[@id='password']"
      );
    });

    expect(result).toEqual({ key: "xpath", percent: 0 });

    await browser.close();
  });

  test("returns 100 if same xpaths", () => {
    expect(
      compareDescriptorKey(
        "xpath",
        "//*[@id='password']",
        "//*[@id='password']"
      )
    ).toEqual({ key: "xpath", percent: 100 });
  });

  test("returns share of base items in compare if arrays", () => {
    expect(
      compareDescriptorKey("labels", ["spirit", "bobcat"], ["spirit", "bear"])
    ).toEqual({ key: "labels", percent: 50 });
  });

  test("returns 0 if strings not equal", () => {
    expect(compareDescriptorKey("id", "spirit", "bobcat")).toEqual({
      key: "id",
      percent: 0
    });
  });

  test("returns 100 if strings equal", () => {
    expect(compareDescriptorKey("id", "spirit", "spirit")).toEqual({
      key: "id",
      percent: 100
    });
  });
});

describe("compareDescriptors", () => {
  test("returns list of matches between target and compare", () => {
    expect(
      compareDescriptors(
        {
          id: "spirit",
          labels: ["spirit", "wolf"],
          tagName: "div",
          textContent: "spirit"
        },
        { id: "bobcat", labels: ["spirit"], tagName: "div" }
      )
    ).toEqual([
      { key: "labels", percent: 50 },
      { key: "tagName", percent: 100 }
    ]);
  });

  test("returns empty array if no matches", () => {
    expect(
      compareDescriptors(
        {
          id: "spirit",
          labels: ["spirit"],
          textContent: "spirit"
        },
        { id: "bobcat", labels: ["bobcat"], tagName: "div" }
      )
    ).toEqual([]);
  });
});

describe("countPresentKeys", () => {
  test("returns number of non-null keys in descriptor", () => {
    expect(
      countPresentKeys({
        dataValue: undefined,
        inputType: "text",
        labels: ["username"],
        placeholder: null,
        tagName: "input",
        textContent: null
      })
    ).toBe(3);
  });

  test("throws error if all keys have no value", () => {
    expect(() => {
      countPresentKeys({ dataValue: undefined, textContent: null });
    }).toThrowError();
  });
});

describe("isSelectValueAvailable", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    page = await browser.currentPage();
  });

  afterAll(() => browser.close());

  test("returns true if value not specified", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown);
    });

    expect(isAvailable).toBe(true);
  });

  test("returns true if element not select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const h3 = document.getElementsByTagName("h3")[0]!;

      return qawolf.match.isSelectValueAvailable(h3, "2");
    });

    expect(isAvailable).toBe(true);
  });

  test("returns true if specified value is option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown, "2");
    });

    expect(isAvailable).toBe(true);
  });

  test("returns false if specified value is not option in select", async () => {
    const isAvailable = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;
      const dropdown = document.getElementById("dropdown")!;

      return qawolf.match.isSelectValueAvailable(dropdown, "11");
    });

    expect(isAvailable).toBe(false);
  });
});

describe("matchElements", () => {
  test("returns elements that match if data attribute specified", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const username = document.getElementById("username")!;
      username.setAttribute("data-qa", "username");

      const password = document.getElementById("password")!;
      password.setAttribute("data-qa", "username");

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const matches = qawolf.match.matchElements({
        dataAttribute: "data-qa",
        target: {
          dataValue: "username",
          labels: ["username"],
          tagName: "input"
        },
        elements
      });

      username.removeAttribute("data-qa");
      password.removeAttribute("data-qa");

      return matches.map((match: Match) => {
        return {
          element: qawolf.xpath.getXpath(match.element),
          targetMatches: match.targetMatches,
          value: match.value
        };
      });
    });
    console.log("RESULT", result);
    expect(result).toEqual([
      {
        element: "//*[@id='username']",
        targetMatches: [
          { key: "dataValue", percent: 100 },
          { key: "labels", percent: 100 },
          { key: "tagName", percent: 100 }
        ],
        value: 300
      },
      {
        element: "//*[@id='password']",
        targetMatches: [
          { key: "dataValue", percent: 100 },
          { key: "tagName", percent: 100 }
        ],
        value: 200
      }
    ]);

    await browser.close();
  });

  test("returns elements that match if data attribute not specified", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const matches = qawolf.match.matchElements({
        dataAttribute: null,
        target: { labels: ["username"], tagName: "input" },
        elements
      });

      return matches.map((match: Match) => {
        return {
          element: qawolf.xpath.getXpath(match.element),
          targetMatches: match.targetMatches,
          value: match.value
        };
      });
    });

    expect(result).toEqual([
      {
        element: "//*[@id='username']",
        targetMatches: [
          { key: "labels", percent: 100 },
          { key: "tagName", percent: 100 }
        ],
        value: 200
      }
    ]);

    await browser.close();
  });

  test("returns empty array if strong matches required and none found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const matches = qawolf.match.matchElements({
        dataAttribute: null,
        target: { tagName: "input" },
        elements,
        requireStrongMatch: true
      });

      return matches.map((match: Match) => {
        return {
          element: qawolf.xpath.getXpath(match.element),
          targetMatches: match.targetMatches,
          value: match.value
        };
      });
    });

    expect(result).toEqual([]);

    await browser.close();
  });
});

describe("topMatch", () => {
  test("returns null if no matches found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const match = qawolf.match.topMatch({
        dataAttribute: null,
        target: { tagName: "input" },
        elements,
        requireStrongMatch: true
      });

      if (!match) return null;
      return {
        element: qawolf.xpath.getXpath(match.element),
        targetMatches: match.targetMatches,
        value: match.value
      };
    });

    expect(result).toBeNull();

    await browser.close();
  });

  test("returns null if multiple tied matches found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const match = qawolf.match.topMatch({
        dataAttribute: null,
        target: { tagName: "input" },
        elements
      });

      if (!match) return null;
      return {
        element: qawolf.xpath.getXpath(match.element),
        targetMatches: match.targetMatches,
        value: match.value
      };
    });

    expect(result).toBeNull();

    await browser.close();
  });

  test("returns top match if one found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolf = (window as any).qawolf;

      const collection = document.querySelectorAll("input,button");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const match = qawolf.match.topMatch({
        dataAttribute: null,
        target: { labels: ["username"], tagName: "input" },
        elements
      });

      if (!match) return null;
      return {
        element: qawolf.xpath.getXpath(match.element),
        targetMatches: match.targetMatches,
        value: match.value
      };
    });

    expect(result).toEqual({
      element: "//*[@id='username']",
      targetMatches: [
        { key: "labels", percent: 100 },
        { key: "tagName", percent: 100 }
      ],
      value: 200
    });

    await browser.close();
  });
});
