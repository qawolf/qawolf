import { FindElementOptions, TextSelector } from "@qawolf/types";
import { queryElements } from "./query";
import { waitFor } from "../wait";

export const findText = async (
  selector: TextSelector,
  options: FindElementOptions
): Promise<Element | null> => {
  console[options.log ? "log" : "debug"](
    `qawolf: find text ${selector.text}`,
    options
  );

  if (!selector.text) {
    throw new Error("selector must include text property");
  }

  return waitFor(
    () => {
      const elements = queryElements(options.action);

      let match = null;
      let matchDescendants = 0;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;

        // skip non-HTML elements
        if (!element.innerText) continue;

        // skip elements without the text
        if (!element.innerText.includes(selector.text!)) continue;

        // skip elements with extra text
        if (
          match &&
          element.innerText.trim().length > match.innerText.trim().length
        )
          continue;

        // prefer deeper elements
        const descendants = element.querySelectorAll("*").length;
        if (!match || descendants <= matchDescendants) {
          match = element;
          matchDescendants = descendants;
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
