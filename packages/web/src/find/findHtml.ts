import { DocSelector, FindElementOptions, HtmlSelector } from "@qawolf/types";
import { DocMatch, matchDocSelector } from "./compare";
import { describeDoc } from "../format";
import { queryElements } from "./query";
import { deserializeDocSelector, nodeToDocSelector } from "../serialize";
import { waitFor } from "../wait";
import { getXpath } from "../xpath";

type ElementMatch = {
  element: Element;
  match: DocMatch;
};

export const findHtml = async (
  selector: HtmlSelector,
  options: FindElementOptions
) => {
  if (!selector.html) {
    throw new Error("selector must include html property");
  }

  const docSelector = deserializeDocSelector(selector.html);

  const nodeName = docSelector.node.name;
  if (nodeName === "body" || nodeName === "html") {
    // use css selector for top level nodes
    return document.querySelector(nodeName);
  }

  console[options.log ? "log" : "debug"](
    `qawolf: find html${describeDoc(docSelector)}`,
    selector,
    options
  );

  let topElementMatch: ElementMatch | null = null;

  // if there is no timeout -- start at the min threshold
  let threshold = options.timeoutMs ? 100 : 75;

  const elementMatch = await waitFor(
    () => {
      const elements = queryElements(options.action);
      const matches = matchElements(elements, docSelector);

      if (matches.length < 1) return;
      topElementMatch = matches[0];

      const topMatch = topElementMatch.match;
      if (topMatch.strongKeys.length) {
        console.debug(
          `qawolf: matched: ${topMatch.strongKeys}`,
          `${topMatch.percent}%`,
          getXpath(topElementMatch!.element),
          topMatch.comparison
        );
        return topElementMatch;
      }

      if (topMatch.percent >= threshold) {
        console.debug(
          `qawolf: matched: ${topMatch.percent}% > ${threshold}% threshold`,
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
    console.debug("qawolf: no match :(");

    if (topElementMatch) {
      console.debug(
        `qawolf: closest match`,
        getXpath(topElementMatch!.element),
        topElementMatch!.match
      );
    }

    return null;
  }

  return elementMatch.element;
};

export const matchElements = (
  elements: Element[],
  target: DocSelector
): ElementMatch[] => {
  let matches: ElementMatch[] = [];

  elements.forEach(element => {
    try {
      const selector = nodeToDocSelector(element);
      const match = matchDocSelector(target, selector);
      matches.push({ element, match });
    } catch (e) {
      // catch parsing errors on malformed elements
      console.debug("qawolf: could not match element", element, e);
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
