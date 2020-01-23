import { CssSelector, FindElementOptions } from "@qawolf/types";
import { waitFor } from "../wait";

export const findCss = async (
  selector: CssSelector,
  options: FindElementOptions
): Promise<Element | null> => {
  console[options.log ? "log" : "debug"](
    `qawolf: find css ${selector.css}`,
    options
  );

  if (!selector.css) {
    throw new Error("selector must include css property");
  }

  return waitFor(
    () => document.querySelector(selector.css!),
    options.timeoutMs || 0,
    100
  );
};
