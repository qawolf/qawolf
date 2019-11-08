import { Action } from "@qawolf/types";

export const formatMethod = (action: Action, index: number): string => {
  const stepParam = `steps[${index}]`;

  if (action === "click") {
    return `click(${stepParam})`;
  }

  if (action === "scroll") {
    return `scroll(${stepParam}, values[${index}])`;
  }

  if (action === "select") {
    return `select(${stepParam}, values[${index}])`;
  }

  if (action === "type") {
    return `type(${stepParam}, values[${index}])`;
  }

  throw new Error(`Invalid step action ${action}`);
};
