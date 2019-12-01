import { FindOptions } from "@qawolf/types";
import { waitFor } from "../wait";

export const findCss = async (
  cssSelector: string,
  options: FindOptions
): Promise<Element | null> => {
  console.log("findCss", cssSelector, "opts", options);

  return waitFor(
    () => document.querySelector(cssSelector),
    options.timeoutMs,
    100
  );
};
