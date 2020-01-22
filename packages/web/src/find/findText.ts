import { FindElementOptions, TextSelector } from "@qawolf/types";
import { queryElements } from "./query";
import { waitFor } from "../wait";

export const findText = async (
  selector: TextSelector,
  options: FindElementOptions
): Promise<Element | null> => {
  console.debug("qawolf: findText", selector, "options", options);
  if (!selector.text) {
    throw new Error("findText: selector must include text property");
  }

  return waitFor(
    () => {
      const elements = queryElements(options.action);

      let match = null;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;

        // skip non-HTML elements
        if (!element.innerText) continue;

        if (
          // check the innerText includes the selector.text
          element.innerText.includes(selector.text!) &&
          // check the match is better than the current match (has less extra text)
          (!match || match.innerText.length > element.innerText.length)
        ) {
          match = element;
        }
      }

      if (match) {
        console.debug("qawolf: found text", match);
      }

      return match;
    },
    options.timeoutMs || 0,
    100
  );
};
