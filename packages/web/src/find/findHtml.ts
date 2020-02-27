import { DocSelector, FindElementOptions, HtmlSelector } from "@qawolf/types";
import { DocMatch, matchDocSelector } from "./compare";
import { queryElements } from "./query";
import { deserializeDocSelector, nodeToDocSelector } from "../serialize";

type ElementMatch = {
  element: Element;
  match: DocMatch;
};

export const findHtml = async (
  selector: HtmlSelector,
  options: FindElementOptions
) => {
  const docSelector = deserializeDocSelector(selector.html);

  const nodeName = docSelector.node.name;
  if (nodeName === "body" || nodeName === "html") {
    // use css selector for top level nodes
    return document.querySelectorAll(nodeName);
  }

  const elements = queryElements(options.action);
  const elementMatches = matchElements(elements, docSelector);

  return elementMatches
    .filter(({ match }) => match.strongKeys.length || match.percent >= 75)
    .map(({ element }) => element);
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
