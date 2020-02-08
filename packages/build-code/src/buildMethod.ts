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
  if (!previousStep) return "";
  if (step.page === previousStep.page) return "";

  return `, { page: ${step.page} }`;
};
