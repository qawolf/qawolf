import { DocTarget, Locator } from "@qawolf/types";
import { DocMatch, matchTarget } from "./compare";
import { queryElements } from "./query";
import { nodeToDocTarget } from "./serialize";
import { waitFor } from "./wait";
import { getXpath } from "./xpath";

type ElementMatch = {
  element: HTMLElement;
  match: DocMatch;
};

export const matchElements = (
  elements: HTMLElement[],
  target: DocTarget
): ElementMatch[] => {
  let matches: ElementMatch[] = [];

  elements.forEach(element => {
    const elementDoc = nodeToDocTarget(element);

    const match = matchTarget(target, elementDoc);
    matches.push({ element, match });
  });

  // sort descending
  matches.sort((a, b) => b.match.percent - a.match.percent);

  return matches;
};

export const findElement = async (locator: Locator) => {
  // if there is no timeout -- set the min threshold
  let threshold = locator.timeoutMs ? 100 : 75;

  let topElementMatch: ElementMatch | null = null;

  console.log("findElement", locator);

  const elementMatch = await waitFor(
    () => {
      const elements = queryElements(locator);
      const matches = matchElements(elements, locator.target);

      if (matches.length < 1) return;
      topElementMatch = matches[0];

      const topMatch = topElementMatch.match;
      if (topMatch.strongKeys.length) {
        console.log(
          `matched: ${topMatch.strongKeys}`,
          `${topMatch.percent}%`,
          getXpath(topElementMatch!.element),
          topMatch.nodeComparison
        );
        return topElementMatch;
      }

      if (topMatch.percent >= threshold) {
        console.log(
          `matched: ${topMatch.percent}% > ${threshold}% threshold`,
          getXpath(topElementMatch!.element),
          topMatch.nodeComparison
        );
        return topElementMatch;
      }

      // reduce threshold 1% per second
      threshold = Math.max(75, threshold - 0.1);
    },
    locator.timeoutMs,
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

export const hasText = async (
  text: string,
  timeoutMs: number
): Promise<boolean> => {
  const hasTextFn = () => {
    const innerText = document.documentElement
      ? document.documentElement.innerText
      : "";
    if (innerText.includes(text)) {
      return true;
    }
    return null;
  };

  const result = await waitFor(hasTextFn, timeoutMs, 100);
  return result || false;
};
