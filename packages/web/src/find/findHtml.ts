import { DocSelector, FindOptions } from "@qawolf/types";
import { DocMatch, matchTarget } from "./compare";
import { queryElements } from "./query";
import { nodeToDocSelector } from "../serialize";
import { waitFor } from "../wait";
import { getXpath } from "../xpath";

type ElementMatch = {
  element: HTMLElement;
  match: DocMatch;
};

export const matchElements = (
  elements: HTMLElement[],
  target: DocSelector
): ElementMatch[] => {
  let matches: ElementMatch[] = [];

  elements.forEach(element => {
    const selector = nodeToDocSelector(element);
    const match = matchTarget(target, selector);
    matches.push({ element, match });
  });

  // sort descending
  matches.sort((a, b) => b.match.percent - a.match.percent);

  return matches;
};

export const findHtml = async (selector: DocSelector, options: FindOptions) => {
  // if there is no timeout -- start at the min threshold
  let threshold = options.timeoutMs ? 100 : 75;

  let topElementMatch: ElementMatch | null = null;

  console.log("findElement", selector);

  const elementMatch = await waitFor(
    () => {
      const elements = queryElements(selector, options);
      const matches = matchElements(elements, selector);

      if (matches.length < 1) return;
      topElementMatch = matches[0];

      const topMatch = topElementMatch.match;
      if (topMatch.strongKeys.length) {
        console.log(
          `matched: ${topMatch.strongKeys}`,
          `${topMatch.percent}%`,
          getXpath(topElementMatch!.element),
          topMatch.comparison
        );
        return topElementMatch;
      }

      if (topMatch.percent >= threshold) {
        console.log(
          `matched: ${topMatch.percent}% > ${threshold}% threshold`,
          getXpath(topElementMatch!.element),
          topMatch.comparison
        );
        return topElementMatch;
      }

      // reduce threshold 1% per second
      threshold = Math.max(75, threshold - 0.1);
    },
    options.timeoutMs,
    100
  );

  if (!elementMatch) {
    console.log("no match :(");

    if (topElementMatch) {
      console.log(
        `closest match`,
        getXpath(topElementMatch!.element),
        topElementMatch!.match
      );
    }

    return null;
  }

  return elementMatch.element;
};
