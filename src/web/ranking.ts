// import { BrowserAction, ElementProperties } from "./BrowserAction";
// import { getXpath } from "../web/xpath";

import { ElementSelector } from "../types";

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

export const computeSimilarityScore = (): number => {
  return 0;
};

// const computeSimilarityScore = (
//   compareProperties: ElementProperties,
//   baseProperties: ElementProperties
// ): number => {
//   let score: number = 0;
//   Object.keys(baseProperties).forEach(key => {
//     const baseProperty = (baseProperties as BaseElementsProperties)[key];
//     const compareProperty = (compareProperties as BaseElementsProperties)[key];

//     if (
//       typeof baseProperty === "string" &&
//       typeof compareProperty === "string" &&
//       baseProperty === compareProperty
//     ) {
//       score += 100;
//     } else if (
//       baseProperty &&
//       typeof baseProperty === "object" &&
//       baseProperty.length &&
//       compareProperty &&
//       typeof compareProperty === "object" &&
//       compareProperty.length
//     ) {
//       // both are arrays
//       const sames = (compareProperty as string[]).filter(item =>
//         (baseProperty as string[]).includes(item)
//       );
//       const percentSame = sames.length / (baseProperty as string[]).length;
//       score += Math.round(Math.min(percentSame, 1) * 100);
//     }
//   });

//   return score;
// };

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
