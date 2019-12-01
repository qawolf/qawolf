import { FindOptions } from "@qawolf/types";
import { cleanText } from "../lang";
import { waitFor } from "../wait";

export const findText = async (
  text: string,
  options: FindOptions
): Promise<Element | null> => {
  const selector = cleanText(text);
  console.log("findText", selector, "opts", options);

  return waitFor(
    () => {
      const elements = document.querySelectorAll("*");
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (cleanText(element.innerText) === selector) return element;
      }

      return null;
    },
    options.timeoutMs,
    100
  );
};
