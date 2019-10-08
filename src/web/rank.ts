import { getSerializedLocator } from "./serializedLocator";
import { computeMaxPossibleScore, computeSimilarityScore } from "./score";
import { BrowserStep } from "../types";

const DEFAULT_THRESHOLD = 0.6;

export const computeSimilarityScores = (
  step: BrowserStep,
  elements: Element[],
  dataAttribute: string | null
): number[] => {
  const base = step.locator;

  const scores: number[] = [];

  for (let i = 0; i < elements.length; i++) {
    const compare = getSerializedLocator(
      elements[i] as HTMLElement,
      dataAttribute
    );

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
  const qualifiedName = step.action === "input" ? "input,textarea,select" : "*";

  const elements = document.querySelectorAll(qualifiedName);

  const candidates: Element[] = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const rect = element.getBoundingClientRect();
    if (rect.height && rect.width) candidates.push(element);
  }

  return candidates;
};

export const findElementByDataValue = (
  dataAttribute: string,
  dataValue: string
): Element | null => {
  const selector = `[${dataAttribute}='${dataValue}']`;
  const elements = document.querySelectorAll(selector);
  if (elements.length > 1) {
    throw new Error(
      `Can't decide: found ${elements.length} elements with data attribute ${selector}`
    );
  }

  return elements[0] || null;
};

export const findTopElement = (
  step: BrowserStep,
  dataAttribute: string | null,
  threshold: number = DEFAULT_THRESHOLD
): Element | null => {
  const elements = findCandidateElements(step);
  const scores = computeSimilarityScores(step, elements, dataAttribute);
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
  dataAttribute: string | null,
  timeout: number = 30000,
  threshold: number = DEFAULT_THRESHOLD
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      let element: Element | null = null;
      if (dataAttribute && step.locator.dataValue) {
        element = findElementByDataValue(dataAttribute, step.locator.dataValue);
      } else {
        element = findTopElement(step, dataAttribute, threshold);
      }

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
