import { Locator } from "../types";
import { compareXpaths } from "./xpath";

export const computeArraySimilarityScore = (
  compare: string[] | null | undefined,
  base: string[] | null | undefined
): number => {
  if (!base || !compare || !base.length) return 0;
  let similarityScore: number = 0;

  base.forEach(value => {
    if (compare.includes(value)) {
      similarityScore += 1;
    }
  });

  return Math.round((similarityScore / base.length) * 100);
};

export const computeStringSimilarityScore = (
  compare: string | null | undefined,
  base: string | null | undefined
): number => {
  if (!base || !compare) return 0;
  if (base === compare) return 100;

  return 0;
};

export const computeSimilarityScore = (
  compare: Locator,
  base: Locator
): number => {
  let score: number = 0;

  score += computeArraySimilarityScore(compare.classList, base.classList);
  score += computeStringSimilarityScore(compare.dataValue, base.dataValue);
  score += computeStringSimilarityScore(compare.href, base.href);
  score += computeStringSimilarityScore(compare.id, base.id);
  score += computeStringSimilarityScore(compare.inputType, base.inputType);
  score += computeArraySimilarityScore(compare.labels, base.labels);
  score += computeStringSimilarityScore(compare.name, base.name);
  score += computeArraySimilarityScore(compare.parentText, base.parentText);
  score += computeStringSimilarityScore(compare.placeholder, base.placeholder);
  score += computeStringSimilarityScore(compare.tagName, base.tagName);
  score += computeStringSimilarityScore(compare.textContent, base.textContent);
  score += compareXpaths(compare.xpath, base.xpath) ? 100 : 0;

  return score;
};

export const computeMaxPossibleScore = (base: Locator): number => {
  let score: number = 0;

  Object.values(base).forEach(value => {
    if (value !== null) {
      score += 100;
    }
  });

  if (!score) {
    throw `Base element ${base} has no recorded properties`;
  }

  return score;
};
