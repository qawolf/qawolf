import { CONFIG } from "@qawolf/config";
import { Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const stepToSelector = (step: Step): Selector => {
  const value = CONFIG.attribute
    ? step.html.node.attrs[CONFIG.attribute]
    : null;

  if (value) {
    return {
      css: `[${CONFIG.attribute}='${value}']`
    };
  }

  return {
    html: serializeDocSelector(step.html)
  };
};
