import { CssSelector, ScrollValue, Step } from "@qawolf/types";
import { stepToSelector } from "./stepToSelector";

export const formatMethod = (
  step: Step,
  previousStep?: Step | null
): string => {
  const selector = formatSelector(step);
  const options = formatOptions(step, previousStep);

  const { action, value } = step;

  if (action === "click") {
    return `await browser.click(${selector}${options});`;
  }

  if (action === "scroll") {
    const scrollValue = value as ScrollValue;
    return `await browser.scroll(${selector}, { x: ${scrollValue.x}, y: ${scrollValue.y} }${options});`;
  }

  if (action === "select") {
    return `await browser.select(${selector}, ${JSON.stringify(
      value
    )}${options});`;
  }

  if (action === "type") {
    return `await browser.type(${selector}, ${JSON.stringify(
      value
    )}${options});`;
  }

  throw new Error(`Invalid step action ${action}`);
};

export const formatOptions = (
  step: Step,
  previousStep?: Step | null
): string => {
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
