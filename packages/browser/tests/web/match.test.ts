import { CONFIG } from "@qawolf/config";
import {
  compareArrays,
  compareDescriptorKey,
  compareDescriptors,
  Match,
  QAWolfWeb
} from "@qawolf/web";
import { Browser } from "../../src/Browser";

describe("compareArrays", () => {
  it("returns 0 if either array is null", () => {
    expect(compareArrays(null, ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], null)).toBe(0);
  });

  it("returns 0 if either array is empty", () => {
    expect(compareArrays([], ["spirit"])).toBe(0);
    expect(compareArrays(["spirit"], [])).toBe(0);
  });

  it("returns the share of base items in compare", () => {
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "bear"])).toBe(50);
    expect(compareArrays(["spirit", "bobcat"], ["spirit", "spirit"])).toBe(50);
  });
});

describe("compareDescriptorKey", () => {
  it("returns 0 if either value is falsy", () => {
    expect(compareDescriptorKey("id", null, "spirit")).toEqual({
      key: "id",
      percent: 0
    });
    expect(compareDescriptorKey("id", "spirit", null)).toEqual({
      key: "id",
      percent: 0
    });
  });

  it("returns 0 if different xpaths", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.match.compareDescriptorKey(
        "xpath",
        "//*[@id='username']",
        "//*[@id='password']"
      );
    });

    expect(result).toEqual({ key: "xpath", percent: 0 });

    await browser.close();
  });

  it("returns 100 if same xpaths", () => {
    expect(
      compareDescriptorKey(
        "xpath",
        "//*[@id='password']",
        "//*[@id='password']"
      )
    ).toEqual({ key: "xpath", percent: 100 });
  });

  it("returns share of base items in compare if arrays", () => {
    expect(
      compareDescriptorKey("labels", ["spirit", "bobcat"], ["spirit", "bear"])
    ).toEqual({ key: "labels", percent: 50 });
  });

  it("returns 0 if strings not equal", () => {
    expect(compareDescriptorKey("id", "spirit", "bobcat")).toEqual({
      key: "id",
      percent: 0
    });
  });

  it("returns 100 if strings equal", () => {
    expect(compareDescriptorKey("id", "spirit", "spirit")).toEqual({
      key: "id",
      percent: 100
    });
  });
});

describe("compareDescriptors", () => {
  it("returns list of matches between target and compare", () => {
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

  it("returns empty array if no matches", () => {
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

describe("matchElements", () => {
  it("returns elements that match if data attribute specified", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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

  it("returns elements that match if data attribute not specified", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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

  it("returns empty array if strong matches required and none found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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
  it("returns null if no matches found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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

  it("returns null if multiple tied matches found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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

  it("returns top match if one found", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

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
