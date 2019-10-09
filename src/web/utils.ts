import { getLabels, getPlaceholder } from "./element";

const arrayEqual = (array1: string[], array2: string[]): boolean => {
  if (array1.length !== array2.length) return false;

  const intersection = array1.filter(item => array2.includes(item));

  return intersection.length === array1.length;
};

export const findByLabels = (
  candidates: Element[],
  labels: string[]
): Element | null => {
  let matchingElement: Element | null = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidateLabels = getLabels(candidates[i] as HTMLElement);
    if (!candidateLabels) continue;

    if (arrayEqual(labels, candidateLabels)) {
      matchingElement = candidates[i];
      break;
    }
  }

  return matchingElement;
};

export const findByName = (
  candidates: Element[],
  name: string
): Element | null => {
  let matchingElement: Element | null = null;

  for (let i = 0; i < candidates.length; i++) {
    if ((candidates[i] as HTMLInputElement).name === name) {
      matchingElement = candidates[i];
      break;
    }
  }

  return matchingElement;
};

export const findByPlaceholder = (
  candidates: Element[],
  placeholder: string
): Element | null => {
  let matchingElement: Element | null = null;
  for (let i = 0; i < candidates.length; i++) {
    if (getPlaceholder(candidates[i] as HTMLElement) === placeholder) {
      matchingElement = candidates[i];
      break;
    }
  }

  return matchingElement;
};

const isVisible = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();

  return !!(rect.height && rect.width);
};

export const queryVisible = (selector: string): Element[] => {
  const elements = document.querySelectorAll(selector);
  const visibleElements: Element[] = [];

  for (let i = 0; i < elements.length; i++) {
    if (isVisible(elements[i])) {
      visibleElements.push(elements[i]);
    }
  }

  return visibleElements;
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
