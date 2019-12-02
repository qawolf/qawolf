import { Action, ScrollValue, StepValue } from "@qawolf/types";

export const formatMethod = (
  action: Action,
  index: number,
  value?: StepValue
): string => {
  const stepParam = `steps[${index}]`;

  if (action === "click") {
    return `click(${stepParam})`;
  }

  if (action === "scroll") {
    const scrollValue = value as ScrollValue;
    return `scroll(${stepParam}, { x: ${scrollValue.x}, y: ${scrollValue.y} })`;
  }

  if (action === "select") {
    return `select(${stepParam}, ${JSON.stringify(value)})`;
  }

  if (action === "type") {
    return `type(${stepParam}, ${JSON.stringify(value)})`;
  }

  throw new Error(`Invalid step action ${action}`);
};
