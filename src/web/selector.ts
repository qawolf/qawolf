import { ElementSelector } from "../types";

// import { BrowserAction, ElementProperties } from "./BrowserAction";
// import { getXpath } from "../web/xpath";

// const DEFAULT_THRESHOLD = 0.75;

export const getLabels = (element: HTMLElement): string[] | null => {
  const labelElements = (element as HTMLInputElement).labels;

  if (!labelElements || !labelElements.length) return null;

  const labels: string[] = [];

  for (let i = 0; i < labelElements.length; i++) {
    const textContent = labelElements[i].textContent;
    if (textContent) {
      labels.push(textContent.toLowerCase());
    }
  }

  return labels;
};

export const getParentText = (element: HTMLElement): string[] | null => {
  if (!element.parentElement) return null;

  if (element.parentElement.textContent) {
    const parentText: string[] = [];

    for (let i = 0; i < element.parentElement.children.length; i++) {
      const textContent = element.parentElement.children[i].textContent;
      if (textContent) {
        parentText.push(textContent.toLowerCase());
      }
      // ensure all content gets included (children that aren't elements)
      parentText.push(element.parentElement.textContent.toLowerCase());
    }

    return parentText;
  }

  return getParentText(element.parentElement);
};

export const getPlaceholder = (element: HTMLElement): string | null => {
  if (!(element as HTMLInputElement).placeholder) return null;

  return (element as HTMLInputElement).placeholder.toLowerCase();
};

export const getSelector = (
  element: HTMLElement | null
): ElementSelector | null => {
  if (!element) {
    return null;
  }

  return {
    classList: (element.className || "").length
      ? element.className.split(" ")
      : null,
    href: (element as HTMLAnchorElement).href || null,
    id: element.id || null,
    inputType: (element as HTMLInputElement).type || null,
    labels: getLabels(element),
    name: (element as HTMLInputElement).name || null,
    parentText: getParentText(element),
    placeholder: getPlaceholder(element),
    tagName: element.tagName ? element.tagName.toLowerCase() : null,
    textContent: getTextContent(element)
  };
};

export const getTextContent = (element: HTMLElement): string | null => {
  if (!element.textContent) return null;

  return element.textContent.toLowerCase();
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
