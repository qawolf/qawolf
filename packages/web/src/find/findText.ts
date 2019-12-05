import { FindOptions, Selector } from "@qawolf/types";
import { cleanText } from "../lang";
import { queryActionElements } from "./query";
import { waitFor } from "../wait";

export const findText = async (
  selector: Selector,
  options: FindOptions
): Promise<Element | null> => {
  console.log("findText", selector, "options", options);
  if (!selector.text) {
    throw new Error("findText: selector must include text property");
  }

  const cleanedText = cleanText(selector.text);

  return waitFor(
    () => {
      const elements = queryActionElements(selector.action);

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (cleanText(element.innerText) === cleanedText) {
          console.log("found text", element);
          return element;
        }
      }

      return null;
    },
    options.timeoutMs || 0,
    100
  );
};
