import { getSelector } from "./selector";
import { computeMaxPossibleScore, computeSimilarityScore } from "./score";
import { BrowserStep } from "../types";
import { getXpath } from "./xpath";

const DEFAULT_THRESHOLD = 0.75;

export const computeSimilarityScores = (
  step: BrowserStep,
  elements: HTMLCollection
): number[] => {
  const base = step.selector;
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

export const findCandidateElements = (step: BrowserStep): HTMLCollection => {
  if (step.type === "type") {
    return document.getElementsByTagName("input");
  }

  return document.getElementsByTagName("*");
};

export const findHighestMatchXpath = (
  step: BrowserStep,
  threshold: number = DEFAULT_THRESHOLD
): string | null => {
  const elements = findCandidateElements(step);
  const scores = computeSimilarityScores(step, elements);
  const maxScore = Math.max(...scores);
  const maxPossibleScore = computeMaxPossibleScore(step.selector!);

  if (maxScore / maxPossibleScore < threshold) {
    return null; // not similar enough
  }
  if (scores.filter(score => score === maxScore).length > 1) {
    return null; // it's a tie
  }

  const highestMatch = elements[scores.indexOf(maxScore)];

  return getXpath(highestMatch);
};
