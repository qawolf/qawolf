import { Action, Locator } from "@qawolf/types";
import { isVisible } from "./element";

type QueryByDataArgs = {
  action: Action;
  dataAttribute?: string;
  dataValue?: string;
};

export const queryActionElements = (action: Action): HTMLElement[] => {
  const selector =
    action === "type" ? "input,select,textarea,[contenteditable='true']" : "*";

  return queryVisibleElements(selector);
};

export const queryDataElements = ({
  action,
  dataAttribute,
  dataValue
}: QueryByDataArgs): HTMLElement[] => {
  let dataSelector = `[${dataAttribute}='${dataValue}']`;
  if (action === "type") {
    const selector = `input${dataSelector},select${dataSelector},textarea${dataSelector},[contenteditable="true"]${dataSelector}`;
    return queryVisibleElements(selector);
  }

  return queryVisibleElements(dataSelector);
};

export const queryElements = ({ action, dataAttribute, target }: Locator) => {
  // TODO ...
  // if (dataAttribute && target.dataValue) {
  //   return queryDataElements({
  //     action,
  //     dataAttribute,
  //     dataValue: target.dataValue!
  //   });
  // }

  return queryActionElements(action);
};

export const queryVisibleElements = (selector: string): HTMLElement[] => {
  const elements = document.querySelectorAll(selector);

  const visibleElements: HTMLElement[] = [];

  for (let i = 0; i < elements.length; i++) {
    // we do not pass computedStyle because doing
    // that for every element would be very expensive
    if (isVisible(elements[i] as HTMLElement)) {
      visibleElements.push(elements[i] as HTMLElement);
    }
  }

  return visibleElements;
};
