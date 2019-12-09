import { Action, ScrollValue, StepValue } from "@qawolf/types";

export const formatMethod = (
  action: Action,
  index: number,
  value?: StepValue
): string => {
  const selector = `selectors[${index}]`;

  if (action === "click") {
    return `browser.click(${selector})`;
  }

  if (action === "scroll") {
    const scrollValue = value as ScrollValue;
    return `browser.scroll(${selector}, { x: ${scrollValue.x}, y: ${scrollValue.y} })`;
  }

  if (action === "select") {
    return `browser.select(${selector}, ${JSON.stringify(value)})`;
  }

  if (action === "type") {
    return `browser.type(${selector}, ${JSON.stringify(value)})`;
  }

  throw new Error(`Invalid step action ${action}`);
};
