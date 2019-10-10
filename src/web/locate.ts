import { waitFor } from "../timer";
import { Action, ElementDescriptor } from "../types";
import { topMatchElement } from "./compare";

type WaitForElementArgs = {
  action: Action;
  dataAttribute: string;
  target: ElementDescriptor;
  timeoutMs?: number;
};

type QueryByDataArgs = {
  action: Action;
  dataAttribute?: string;
  dataValue?: string;
};

export const isVisible = (element: HTMLElement): boolean => {
  return !!(element.offsetWidth && element.offsetHeight);
};

export const queryActionElements = (action: Action): HTMLElement[] => {
  const selector = action === "input" ? "input,select,textarea" : "*";

  return queryVisibleElements(selector);
};

export const queryDataElements = ({
  action,
  dataAttribute,
  dataValue
}: QueryByDataArgs): HTMLElement[] => {
  let dataSelector = `[${dataAttribute}='${dataValue}']`;
  if (action === "input") {
    const selector = `input${dataSelector},select${dataSelector},textarea${dataSelector}`;
    return queryVisibleElements(selector);
  }

  return queryVisibleElements(dataSelector);
};

export const queryVisibleElements = (selector: string): HTMLElement[] => {
  const elements = document.querySelectorAll(selector);

  const visibleElements: HTMLElement[] = [];

  for (let i = 0; i < elements.length; i++) {
    if (isVisible(elements[i] as HTMLElement)) {
      visibleElements.push(elements[i] as HTMLElement);
    }
  }

  return visibleElements;
};

export const waitForElement = async ({
  action,
  dataAttribute,
  target,
  timeoutMs = 30000
}: WaitForElementArgs) => {
  if (dataAttribute && target.dataValue) {
    return waitFor(() => {
      const elements = queryDataElements({
        action,
        dataAttribute,
        dataValue: target.dataValue!
      });

      return topMatchElement({ dataAttribute, target, elements });
    }, timeoutMs);
  }

  const specificMatch = await waitFor(() => {
    const elements = queryActionElements(action);
    return topMatchElement({
      dataAttribute,
      target,
      elements,
      requireSpecific: true
    });
  }, timeoutMs);
  if (specificMatch) return specificMatch;

  const elements = queryActionElements(action);
  return topMatchElement({ dataAttribute, target, elements });
};
