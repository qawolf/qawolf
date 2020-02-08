import { ScrollValue, Step } from "@qawolf/types";
import { buildSelector } from "./buildSelector";

export const buildMethod = (step: Step, previousStep?: Step | null): string => {
  const selector = buildSelector(step);
  const options = buildMethodOptions(step, previousStep);

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

export const buildMethodOptions = (
  step: Step,
  previousStep?: Step | null
): string => {
  const pageChanged = previousStep && step.page !== previousStep.page;

  // we need to specify the page if the step has a different page
  // we don't need to, but we specify the page if it is not 0
  // for clarity and in case they delete steps
  if (pageChanged || step.page !== 0) {
    return `, { page: ${step.page} }`;
  }

  return "";
};
