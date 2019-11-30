import { FindOptions } from "@qawolf/types";
import { waitFor } from "../wait";

export const findCss = async (
  selector: string,
  options: FindOptions
): Promise<Element | null> => {
  console.log("findCss", selector, "opts", options);

  return waitFor(
    () => document.querySelector(selector),
    options.timeoutMs,
    100
  );
};
