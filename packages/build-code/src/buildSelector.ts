import { CssSelector, Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const buildSelector = (step: Step): string => {
  const selector = stepToSelector(step);

  const cssValue = (selector as CssSelector).css;

  if (cssValue) {
    return `{ css: "${cssValue}" }`;
  }

  return `selectors[${step.index}]`;
};

export const stepToSelector = (step: Step): Selector => {
  if (step.cssSelector) {
    return { css: step.cssSelector };
  }

  return {
    html: serializeDocSelector(step.html)
  };
};
