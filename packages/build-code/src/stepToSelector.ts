import { Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const stepToSelector = (step: Step): Selector => {
  return {
    html: serializeDocSelector(step.html),
    page: step.page
  };
};
