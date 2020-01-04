import { CssSelector, ScrollValue, Step } from "@qawolf/types";
import { stepToSelector } from "./stepToSelector";

export const formatMethod = (step: Step, previousStep?: Step): string => {
  const selector = formatSelector(step);
  const options = formatOptions(step, previousStep);

  const { action, value } = step;

  if (action === "click") {
    return `browser.click(${selector}${options})`;
  }

  if (action === "scroll") {
    const scrollValue = value as ScrollValue;
    return `browser.scroll(${selector}, { x: ${scrollValue.x}, y: ${scrollValue.y} }${options})`;
  }

  if (action === "select") {
    return `browser.select(${selector}, ${JSON.stringify(value)}${options})`;
  }

  if (action === "type") {
    return `browser.type(${selector}, ${JSON.stringify(value)}${options})`;
  }

  throw new Error(`Invalid step action ${action}`);
};

export const formatOptions = (step: Step, previousStep?: Step): string => {
  if (!previousStep) return "";
  if (step.page === previousStep.page) return "";

  return `, { page: ${step.page} }`;
};

export const formatSelector = (step: Step): string => {
  const selector = stepToSelector(step);

  const cssValue = (selector as CssSelector).css;

  if (cssValue) {
    return `{ css: "${cssValue}" }`;
  }

  return `selectors[${step.index}]`;
};
