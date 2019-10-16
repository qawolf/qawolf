import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Browser } from "../../src/Browser";

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

  it("returns null if top match found but select value not available", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const collection = document.querySelectorAll("select");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const match = qawolf.match.topMatch({
        dataAttribute: null,
        target: { id: "dropdown", tagName: "select" },
        elements,
        value: "11"
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

  it("returns top match if select value available", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}dropdown` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const collection = document.querySelectorAll("select");
      const elements: HTMLElement[] = [];

      for (let i = 0; i < collection.length; i++) {
        elements.push(collection[i] as HTMLElement);
      }

      const match = qawolf.match.topMatch({
        dataAttribute: null,
        target: { id: "dropdown", tagName: "select" },
        elements,
        value: "2"
      });

      if (!match) return null;
      return {
        element: qawolf.xpath.getXpath(match.element),
        targetMatches: match.targetMatches,
        value: match.value
      };
    });

    expect(result).toEqual({
      element: "//*[@id='dropdown']",
      targetMatches: [
        { key: "id", percent: 100 },
        { key: "tagName", percent: 100 }
      ],
      value: 200
    });

    await browser.close();
  });
});
