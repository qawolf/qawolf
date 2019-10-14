import { topMatch } from "./match";
import { waitFor } from "./timer";
import { Action, Locator } from "./types";

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
  timeoutMs
}: Locator) => {
  if (dataAttribute && target.dataValue) {
    console.log(
      `finding element by data attribute ${dataAttribute}=${target.dataValue}`
    );
    return waitFor(() => {
      const elements = queryDataElements({
        action,
        dataAttribute,
        dataValue: target.dataValue!
      });

      const match = topMatch({ dataAttribute, target, elements });
      if (match) return match.element;

      return null;
    }, timeoutMs);
  }

  console.log("waiting for strong match");
  const strongMatch = await waitFor(() => {
    const elements = queryActionElements(action);
    return topMatch({
      dataAttribute,
      target,
      elements,
      requireStrongMatch: true
    });
  }, timeoutMs);
  if (strongMatch) return strongMatch.element;

  console.log("no strong match found before timeout, choosing top weak match");
  const elements = queryActionElements(action);
  const match = topMatch({ dataAttribute, target, elements });
  if (match) return match.element;

  return null;
};
