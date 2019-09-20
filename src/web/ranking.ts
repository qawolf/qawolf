import { getXpath } from "./xpath";

import { getSelector } from "./selector";
import { ElementSelector, BrowserAction } from "../types";

const DEFAULT_THRESHOLD = 0.75;

export const computeArraySimilarityScore = (
  compare: string[] | null,
  base: string[] | null
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
  compare: string | null,
  base: string | null
): number => {
  if (!base || !compare) return 0;
  if (base === compare) return 100;

  return 0;
};

export const computeSimilarityScore = (
  compare: ElementSelector,
  base: ElementSelector
): number => {
  let score: number = 0;

  score += computeArraySimilarityScore(compare.classList, base.classList);
  score += computeStringSimilarityScore(compare.href, base.href);
  score += computeStringSimilarityScore(compare.id, base.id);
  score += computeStringSimilarityScore(compare.inputType, base.inputType);
  score += computeArraySimilarityScore(compare.labels, base.labels);
  score += computeStringSimilarityScore(compare.name, base.name);
  score += computeArraySimilarityScore(compare.parentText, base.parentText);
  score += computeStringSimilarityScore(compare.placeholder, base.placeholder);
  score += computeStringSimilarityScore(compare.tagName, base.tagName);
  score += computeStringSimilarityScore(compare.textContent, base.textContent);

  return score;
};

export const computeSimilarityScores = (
  action: BrowserAction,
  elements: HTMLCollection
): number[] => {
  const base = action.selector;
  if (!base) {
    throw "Action does not have associated selector";
  }

  const scores: number[] = [];

  for (let i = 0; i < elements.length; i++) {
    const compare = getSelector(elements[i] as HTMLElement);

    if (!compare) {
      scores.push(0);
    } else {
      const score = computeSimilarityScore(compare, base);
      scores.push(score);
    }
  }

  return scores;
};

export const computeMaxPossibleScore = (base: ElementSelector): number => {
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

export const findCandidateElements = (
  action: BrowserAction
): HTMLCollection => {
  if (action.type === "type") {
    return document.getElementsByTagName("input");
  }

  return document.getElementsByTagName("*");
};

export const findHighestMatchXpath = (
  action: BrowserAction,
  threshold: number = DEFAULT_THRESHOLD
): string | null => {
  const elements = findCandidateElements(action);
  const scores = computeSimilarityScores(action, elements);
  const maxScore = Math.max(...scores);
  const maxPossibleScore = computeMaxPossibleScore(action.selector!);

  if (maxScore / maxPossibleScore < threshold) {
    return null; // not similar enough
  }
  if (scores.filter(score => score === maxScore).length > 1) {
    return null; // it's a tie
  }

  const highestMatch = elements[scores.indexOf(maxScore)];

  return getXpath(highestMatch);
};
