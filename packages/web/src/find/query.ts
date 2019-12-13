import { Action, DocSelector } from "@qawolf/types";
import { isVisible } from "../element";

type QueryDataElementsOptions = {
  action?: Action;
  dataAttribute?: string;
  dataValue?: string;
};

type QueryElementsOptions = {
  action?: Action;
  dataAttribute?: string;
};

export const queryActionElements = (action?: Action): Element[] => {
  const selector =
    action === "type" ? "input,select,textarea,[contenteditable='true']" : "*";

  return queryVisibleElements(selector);
};

export const queryDataElements = ({
  action,
  dataAttribute,
  dataValue
}: QueryDataElementsOptions): Element[] => {
  let dataSelector = `[${dataAttribute}='${dataValue}']`;
  if (action === "type") {
    const selector = `input${dataSelector},select${dataSelector},textarea${dataSelector},[contenteditable="true"]${dataSelector}`;
    return queryVisibleElements(selector);
  }

  return queryVisibleElements(dataSelector);
};

export const queryElements = (
  selector: DocSelector,
  { action, dataAttribute }: QueryElementsOptions
) => {
  if (dataAttribute) {
    const dataValue = selector.node.attrs[dataAttribute];
    if (dataValue) {
      return queryDataElements({
        action,
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
