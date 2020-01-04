import { CONFIG } from "@qawolf/config";
import { Selector, Step } from "@qawolf/types";
import { serializeDocSelector } from "@qawolf/web";

export const stepToSelector = (step: Step): Selector => {
  const findValue = CONFIG.findAttribute
    ? step.html.node.attrs[CONFIG.findAttribute]
    : null;

  if (findValue) {
    return {
      css: `[${CONFIG.findAttribute}="${findValue}"]`,
      page: step.page
    };
  }

  return {
    html: serializeDocSelector(step.html),
    page: step.page
  };
};
