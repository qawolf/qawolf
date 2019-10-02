import { getLocator } from "./locator";
import { computeMaxPossibleScore, computeSimilarityScore } from "./score";
import { BrowserStep } from "../types";

const DEFAULT_THRESHOLD = 0.6;

export const computeSimilarityScores = (
  step: BrowserStep,
  elements: Element[]
): number[] => {
  const base = step.locator;

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

export const findCandidateElements = (step: BrowserStep): Element[] => {
  const qualifiedName = step.type === "type" ? "input" : "*";

  const elements = document.getElementsByTagName(qualifiedName);

  const candidates: Element[] = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const rect = element.getBoundingClientRect();
    if (rect.height && rect.width) candidates.push(element);
  }

  return candidates;
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

  const maxElements: Element[] = [];

  scores.forEach((score, index) => {
    if (score < maxScore) return;

    maxElements.push(elements[index]);
  });

  if (maxElements.length > 1) {
    return null; // it's a tie
  }

  return maxElements[0];
};

export const waitForElement = async (
  step: BrowserStep,
  timeout: number = 30000,
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
