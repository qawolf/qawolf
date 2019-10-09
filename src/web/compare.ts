import { ElementDescriptor } from "../types";
import { isXpathEqual } from "./xpath";
import { getDescriptor } from "./element";

type DescriptorKeyMatch = {
  key: keyof ElementDescriptor;
  percent: number;
};

type TopMatchArgs = {
  dataAttribute: string;
  target: ElementDescriptor;
  elements: HTMLElement[];
  requireSpecific?: boolean;
};

const isNil = (value: any) => {
  return typeof value === "undefined" || value === null;
};

export const buildDescriptorMatches = (
  target: ElementDescriptor,
  compare: ElementDescriptor
): DescriptorKeyMatch[] => {
  const matches: DescriptorKeyMatch[] = [];

  for (const key of Object.keys(target) as (keyof ElementDescriptor)[]) {
    const targetValue = target[key];
    const compareValue = compare[key];
    if (isNil(targetValue) || isNil(compareValue)) continue;

    let percent = 0;
    if (key === "xpath") {
      percent = isXpathEqual(targetValue as string, compareValue as string)
        ? 100
        : 0;
    } else if (Array.isArray(targetValue) && Array.isArray(compareValue)) {
      percent = compareArray(targetValue, compareValue);
    } else {
      percent = targetValue === compare[key] ? 100 : 0;
    }

    if (percent > 0) {
      matches.push({ key, percent });
    }
  }

  return matches;
};

export const compareArray = (
  base: string[] | null | undefined,
  compare: string[] | null | undefined
): number => {
  if (!base || !base.length || !compare || !compare.length) return 0;

  const baseItemsInCompare = base.filter(v => compare.includes(v)).length;
  return Math.round((baseItemsInCompare / base.length) * 100);
};

const specificKeys: (keyof ElementDescriptor)[] = [
  "id",
  "name",
  "labels",
  "placeholder",
  "textContent",
  "xpath"
];

export const topMatchElement = ({
  dataAttribute,
  target,
  elements,
  requireSpecific = false
}: TopMatchArgs) => {
  let topScore = -1;
  let topElement = null;

  elements.forEach(element => {
    const descriptor = getDescriptor(element, dataAttribute);
    let matches = buildDescriptorMatches(target, descriptor);

    // only include matches if there is a specific match
    if (requireSpecific && !matches.find(m => specificKeys.includes(m.key))) {
      return;
    }

    const matchValue = matches.reduce(
      (accumulator, match) => accumulator + match.percent,
      0
    );

    if (matchValue > topScore) {
      topElement = element;
    } else if (matchValue === topScore) {
      // clear ambiguous match
      topElement = null;
    }
  });

  return topElement;
};
