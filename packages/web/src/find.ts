import { DocTarget, Locator } from "@qawolf/types";
import { DocMatch, matchTarget } from "./compare";
import { queryElements } from "./query";
import { nodeToDocTarget } from "./serialize";
import { waitFor } from "./wait";
// import { getXpath } from "./xpath";

export const matchElements = (
  elements: HTMLElement[],
  target: DocTarget
): DocMatch[] => {
  // TODO include elements with matches
  let matches: DocMatch[] = [];
  elements.forEach(element => {
    const elementDoc = nodeToDocTarget(element);
    matches.push(matchTarget(target, elementDoc));
  });

  // sort descending
  matches.sort((a, b) => b.percent - a.percent);

  return matches;
};

export const findElement = async (locator: Locator) => {
  let threshold = 1;

  let topMatch: DocMatch | null = null;

  const match = await waitFor(
    () => {
      const elements = queryElements(locator);
      const matches = matchElements(elements, locator.target);

      if (matches.length < 1) return;

      topMatch = matches[0];
      if (topMatch.strongKeys.length) {
        console.log(
          `matched: ${topMatch.strongKeys}`,
          `${topMatch.percent}%`,
          // getXpath(topMatch.element),
          topMatch.nodeComparison
        );
        return topMatch;
      }

      if (topMatch.percent >= threshold) {
        console.log(
          `matched: ${topMatch.percent}% > ${threshold}% threshold`,
          // getXpath(topMatch.element),
          topMatch.nodeComparison
        );
        return topMatch;
      }

      // reduce threshold 1% per second
      threshold = Math.max(0.75, threshold - 0.001);
    },
    locator.timeoutMs,
    100
  );

  if (!match) {
    console.log("no match :(");

    if (topMatch) {
      console.log(
        `closest match: ${topMatch!.percent}%`,
        // getXpath(topMatch.element),
        topMatch!.nodeComparison
      );
    }
  }

  return match;
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
