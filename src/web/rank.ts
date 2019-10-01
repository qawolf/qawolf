import { getLocator } from "./locator";
import { computeMaxPossibleScore, computeSimilarityScore } from "./score";
import { BrowserStep } from "../types";

const DEFAULT_THRESHOLD = 0.6;

export const computeSimilarityScores = (
  step: BrowserStep,
  elements: HTMLCollection
): number[] => {
  const base = step.locator;
  if (!base) {
    throw "Action does not have associated locator";
  }

  const scores: number[] = [];

  for (let i = 0; i < elements.length; i++) {
    const compare = getLocator(elements[i] as HTMLElement);

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

export const findTopElement = (
  step: BrowserStep,
  threshold: number = DEFAULT_THRESHOLD
): Element | null => {
  const elements = findCandidateElements(step);
  const scores = computeSimilarityScores(step, elements);
  const maxScore = Math.max(...scores);
  const maxPossibleScore = computeMaxPossibleScore(step.locator!);

  if (maxScore / maxPossibleScore < threshold) {
    return null; // not similar enough
  }
  if (scores.filter(score => score === maxScore).length > 1) {
    return null; // it's a tie
  }

  const topMatch = elements[scores.indexOf(maxScore)];
  return topMatch;
};

export const waitForElement = async (
  step: BrowserStep,
  timeout: number = 5000,
  threshold: number = DEFAULT_THRESHOLD
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      const element = findTopElement(step, threshold);

      if (element) {
        console.log("waitForElement: found element", element);
        clearInterval(intervalId);
        clearTimeout(rejectId);
        resolve(element);
      }
    }, 100);

    const rejectId = setTimeout(() => {
      reject(`No element found for step ${JSON.stringify(step)}`);
      clearInterval(intervalId);
    }, timeout);
  });
};
