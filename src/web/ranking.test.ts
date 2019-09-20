import Browser from "../Browser";
import { CONFIG } from "../config";
import {
  computeArraySimilarityScore,
  computeMaxPossibleScore,
  computeSimilarityScore,
  computeSimilarityScores,
  computeStringSimilarityScore
} from "./ranking";
import { QAWolf } from "../types";

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

describe("ranking.computeArraySimilarityScore", () => {
  test("returns 0 if either are null", () => {
    const score = computeArraySimilarityScore(null, null);
    expect(score).toBe(0);

    const score2 = computeArraySimilarityScore(["spirit"], null);
    expect(score2).toBe(0);

    const score3 = computeArraySimilarityScore(null, ["spirit"]);
    expect(score3).toBe(0);
  });

  test("returns 0 if base array empty", () => {
    const score = computeArraySimilarityScore(["spirit"], []);
    expect(score).toBe(0);
  });

  test("returns rounded percent similar if both have items", () => {
    const score = computeArraySimilarityScore(
      ["spirit", "bobcat", "bear"],
      ["spirit", "bobcat", "moose"]
    );
    expect(score).toBe(67);
  });
});

describe("ranking.computeStringSimilarityScore", () => {
  test("returns 0 if either are null", () => {
    const score = computeStringSimilarityScore(null, null);
    expect(score).toBe(0);

    const score2 = computeStringSimilarityScore("spirit", null);
    expect(score2).toBe(0);

    const score3 = computeStringSimilarityScore(null, "spirit");
    expect(score3).toBe(0);
  });

  test("returns 100 if strings are the same", () => {
    const score = computeStringSimilarityScore("spirit", "spirit");
    expect(score).toBe(100);
  });

  test("returns 0 if strings are different", () => {
    const score = computeStringSimilarityScore("spirit", "bobcat");
    expect(score).toBe(0);
  });
});

describe("ranking.computeSimilarityScore", () => {
  test("returns correct similarity score", () => {
    const compare = {
      classList: ["spirit", "bobcat", "bear"],
      href: null,
      id: "spirit",
      inputType: null,
      labels: null,
      name: null,
      parentText: ["some text", "more text"],
      placeholder: null,
      tagName: "button",
      textContent: "click me!"
    };

    const score = computeSimilarityScore(compare, base);
    expect(score).toBe(317);
  });
});

describe("ranking.computeMaxPossibleScore", () => {
  test("returns correct max possible score", () => {
    const score = computeMaxPossibleScore(base);
    expect(score).toBe(600);
  });

  test("throws error if no properties recorded", () => {
    const baseEmpty = {
      classList: null,
      href: null,
      id: null,
      inputType: null,
      labels: null,
      name: null,
      parentText: null,
      placeholder: null,
      tagName: null,
      textContent: null
    };

    expect(() => computeMaxPossibleScore(baseEmpty)).toThrowError();
  });
});

describe("ranking.computeScoresForElements", () => {
  test("returns scores for each element", async () => {
    const action = {
      selector: { ...base, tagName: "input" },
      sourceEventId: 11,
      target: {
        xpath: "xpath"
      },
      type: "click" as "click"
    };

    const browser = new Browser();
    await browser.launch();
    await browser._browser!.url(`${CONFIG.testUrl}/login`);
    await browser.injectSdk();

    const scores = await browser._browser!.execute(action => {
      const qawolf: QAWolf = (window as any).qawolf;

      return qawolf.ranking.computeSimilarityScores(
        action,
        document.getElementsByTagName("input")
      );
    }, action);

    expect(scores).toEqual([100, 100]);

    browser.close();
  });

  test("throws error if action does not have selector", () => {
    const action = {
      sourceEventId: 11,
      target: {
        xpath: "xpath"
      },
      type: "click" as "click"
    };

    expect(() => {
      computeSimilarityScores(action, new HTMLCollection());
    }).toThrowError();
  });
});
