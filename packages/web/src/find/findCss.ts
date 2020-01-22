import { CssSelector, FindElementOptions } from "@qawolf/types";
import { waitFor } from "../wait";

export const findCss = async (
  selector: CssSelector,
  options: FindElementOptions
): Promise<Element | null> => {
  console.debug("qawolf: findCss", selector, "options", options);
  if (!selector.css) {
    throw new Error("findCss: selector must include css property");
  }

  return waitFor(
    () => document.querySelector(selector.css!),
    options.timeoutMs || 0,
    100
  );
};
