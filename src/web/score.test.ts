import {
  computeArraySimilarityScore,
  computeMaxPossibleScore,
  computeSimilarityScore,
  computeStringSimilarityScore
} from "./score";

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

describe("score.computeArraySimilarityScore", () => {
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

describe("score.computeStringSimilarityScore", () => {
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

describe("score.computeSimilarityScore", () => {
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

describe("score.computeMaxPossibleScore", () => {
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
