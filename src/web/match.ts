import { getDescriptor } from "./element";
import { ElementDescriptor } from "../types";
import { isXpathEqual } from "./xpath";

type DescriptorMatch = {
  key: keyof ElementDescriptor;
  percent: number;
};

type DescriptorValue = string | string[] | null | undefined;

type MatchArgs = {
  dataAttribute: string | null;
  target: ElementDescriptor;
  elements: HTMLElement[];
  requireStrongMatch?: boolean;
};

export type Match = {
  element: HTMLElement;
  targetMatches: Array<{ key: keyof ElementDescriptor; percent: number }>;
  value: number;
};

const strongMatchKeys: (keyof ElementDescriptor)[] = [
  "id",
  "name",
  "labels",
  "placeholder",
  "textContent",
  "xpath"
];

const isNil = (value: any): boolean => {
  return typeof value === "undefined" || value === null;
};

export const compareArrays = (
  base?: string[] | null,
  compare?: string[] | null
): number => {
  if (!base || !base.length || !compare || !compare.length) return 0;

  const baseItemsInCompare = base.filter(v => compare.includes(v)).length;

  return Math.round((baseItemsInCompare / base.length) * 100);
};

export const compareDescriptorKey = (
  key: keyof ElementDescriptor,
  targetValue: DescriptorValue,
  compareValue: DescriptorValue
) => {
  let percent;

  if (isNil(targetValue) || isNil(compareValue)) {
    percent = 0;
  } else if (key === "xpath") {
    const resolveSameElement = isXpathEqual(
      targetValue as string,
      compareValue as string
    );

    percent = resolveSameElement ? 100 : 0;
  } else if (Array.isArray(targetValue) && Array.isArray(compareValue)) {
    percent = compareArrays(targetValue, compareValue);
  } else {
    percent = targetValue === compareValue ? 100 : 0;
  }

  return { key, percent };
};

export const compareDescriptors = (
  target: ElementDescriptor,
  compare: ElementDescriptor
): DescriptorMatch[] => {
  const matches: DescriptorMatch[] = [];

  for (const key of Object.keys(target) as (keyof ElementDescriptor)[]) {
    const match = compareDescriptorKey(key, target[key], compare[key]);
    if (match.percent > 0) matches.push(match);
  }

  return matches;
};

export const matchElements = ({
  dataAttribute,
  target,
  elements,
  requireStrongMatch = false
}: MatchArgs): Match[] => {
  const matches: Match[] = [];

  elements.forEach(element => {
    const descriptor = getDescriptor(element, dataAttribute);

    let targetMatches = compareDescriptors(target, descriptor);

    const strongMatch = targetMatches.find(m =>
      strongMatchKeys.includes(m.key)
    );

    const majorityMatch =
      targetMatches.length / Object.keys(target).length > 0.5;

    // only consider a match if it matches a strong match key
    // or a majority of the other keys
    if (!strongMatch && !majorityMatch) {
      targetMatches = [];
    } else if (requireStrongMatch && !strongMatch) {
      targetMatches = [];
    }

    const value = targetMatches.reduce(
      (accumulator, match) => accumulator + match.percent,
      0
    );

    if (value) {
      matches.push({ element, targetMatches, value });
    }
  });

  return matches;
};

export const topMatch = (args: MatchArgs): Match | null => {
  // sort descending by match value
  const matches = matchElements(args).sort((a, b) =>
    a.value > b.value ? -1 : 1
  );

  if (matches.length <= 0 || matches[0].value <= 0) {
    console.log("no match found");
    return null;
  }

  const equalTopMatches = matches.filter(m => m.value === matches[0].value);
  if (equalTopMatches.length > 1) {
    console.log("no match since all top matches are equal", equalTopMatches);
    return null;
  }

  console.log("top match found", matches[0]);
  return matches[0];
};
