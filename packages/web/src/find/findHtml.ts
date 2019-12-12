import { DocSelector, FindElementOptions, Selector } from "@qawolf/types";
import { DocMatch, matchDocSelector } from "./compare";
import { queryElements } from "./query";
import { htmlSelectorToDocSelector, nodeToDocSelector } from "../serialize";
import { waitFor } from "../wait";
import { getXpath } from "../xpath";

type ElementMatch = {
  element: HTMLElement;
  match: DocMatch;
};

export const findHtml = async (
  selector: Selector,
  options: FindElementOptions
) => {
  console.log("findHtml", selector, "options", options);
  if (!selector.html) {
    throw new Error("findHtml: selector must include html property");
  }

  const docSelector = htmlSelectorToDocSelector(selector.html);

  let topElementMatch: ElementMatch | null = null;

  // if there is no timeout -- start at the min threshold
  let threshold = options.timeoutMs ? 100 : 75;

  const elementMatch = await waitFor(
    () => {
      const elements = queryElements(docSelector, {
        action: selector.action,
        dataAttribute: options.dataAttribute
      });
      const matches = matchElements(
        elements,
        docSelector,
        options.dataAttribute
      );

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
    options.timeoutMs || 0,
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

export const matchElements = (
  elements: HTMLElement[],
  target: DocSelector,
  dataAttribute?: string
): ElementMatch[] => {
  let matches: ElementMatch[] = [];

  elements.forEach(element => {
    try {
      const selector = nodeToDocSelector(element);
      const match = matchDocSelector(target, selector, dataAttribute);
      matches.push({ element, match });
    } catch (e) {
      // catch parsing errors on malformed elements
      console.log("could not match element", element, e);
    }
  });

  // sort descending
  matches.sort((a, b) => {
    // sort values with strong matches first
    const aStrongValue = a.match.strongKeys.length > 0 ? 200 : 0;
    const bStrongValue = b.match.strongKeys.length > 0 ? 200 : 0;
    return b.match.percent + bStrongValue - (a.match.percent + aStrongValue);
  });

  return matches;
};
