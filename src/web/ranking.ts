// import { BrowserAction, ElementProperties } from "./BrowserAction";
// import { getXpath } from "../web/xpath";

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

// const findBestElement = (
//   action: BrowserAction,
//   elements: NodeListOf<Element> | HTMLCollection,
//   threshold: number = DEFAULT_THRESHOLD
// ): Element | null => {
//   if (!action.properties) {
//     throw `Action does not have any properties to compare`;
//   }

//   const scores: number[] = [];

//   for (let i = 0; i < elements.length; i++) {
//     const compareProperties = getProperties(elements[i] as HTMLElement);
//     if (!compareProperties) {
//       scores.push(0);
//     } else {
//       const score = computeSimilarityScore(
//         compareProperties,
//         action.properties
//       );
//       scores.push(score);
//     }
//   }

//   let maxPossibleScore: number = 0;
//   Object.keys(action.properties).forEach(key => {
//     if ((action.properties as BaseElementsProperties)[key] !== null) {
//       maxPossibleScore += 100;
//     }
//   });

//   const maxScore = Math.max(...scores);
//   console.log("SCORES", scores, maxScore, maxPossibleScore);
//   if (maxScore / maxPossibleScore < threshold) {
//     return null; // not close enough to act
//   }
//   const matchingScores = scores.filter(score => score === maxScore);
//   if (matchingScores.length > 1) {
//     return null; // it's a tie
//   }

//   const maxIndex = scores.indexOf(maxScore);

//   return elements[maxIndex];
// };

// export default (action: BrowserAction) => {
//   let elements: NodeListOf<Element> | HTMLCollection;
//   if (action.type === "type") {
//     elements = document.getElementsByTagName("input");
//   } else {
//     elements = document.querySelectorAll("*");
//   }

//   const selectedElement = findBestElement(action, elements);
//   console.log("SELECTED", selectedElement);

//   return getXpath(selectedElement);
// };
