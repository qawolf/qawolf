import { Action, DocSelector } from "@qawolf/types";
import { isVisible } from "../element";

type QueryDataElementsOptions = {
  dataAttribute?: string;
  dataValue?: string;
};

type QueryElementsOptions = {
  action?: Action;
  dataAttribute?: string;
};

export const queryActionElements = (action?: Action): Element[] => {
  // TODO test html & body
  const selector =
    action === "type"
      ? // include html & body for hotkeys
        "html,body,input,select,textarea,[contenteditable='true']"
      : "*";

  return queryVisibleElements(selector);
};

export const queryDataElements = ({
  dataAttribute,
  dataValue
}: QueryDataElementsOptions): Element[] => {
  return queryVisibleElements(`[${dataAttribute}='${dataValue}']`);
};

export const queryElements = (
  selector: DocSelector,
  { action, dataAttribute }: QueryElementsOptions
) => {
  if (dataAttribute) {
    const dataValue = selector.node.attrs[dataAttribute];
    if (dataValue) {
      return queryDataElements({
        dataAttribute,
        dataValue
      });
    }
  }

  // default to click since it will query all elements
  return queryActionElements(action);
};

export const queryVisibleElements = (selector: string): Element[] => {
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
