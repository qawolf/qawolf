import {
  computeArraySimilarityScore,
  computeStringSimilarityScore
} from "./ranking";

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
