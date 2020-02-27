import { Action } from "@qawolf/types";
import { isVisible } from "../element";

export const queryElements = (action?: Action): Element[] => {
  const selector =
    action === "type" ? "input,select,textarea,[contenteditable='true']" : "*";

  return queryVisibleElements(selector);
};

export const queryVisibleElements = (selector: string, root?:): Element[] => {
  const elements = document.querySelectorAll(selector);

  const visibleElements: Element[] = [];

  for (let i = 0; i < elements.length; i++) {
    // we do not pass computedStyle because doing
    // that for every element would be very expensive
    if (isVisible(elements[i])) {
      visibleElements.push(elements[i]);
    }
  }

  return visibleElements;
};
