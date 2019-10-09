import { sleep } from "../timer";
import { Action, ElementDescriptor } from "../types";

type LocateElementArgs = {
  action: Action;
  dataAttribute?: string;
  target: ElementDescriptor;
  timeoutMs?: number;
};

type QueryByDataArgs = {
  action: Action;
  dataAttribute?: string;
  dataValue?: string;
};

// Specific:
// id/name/labels/placeholder/textContent

// Match({ specific: true/false })
// Xpath
// Href

export const isVisible = (element: HTMLElement): boolean => {
  return !!(element.offsetWidth && element.offsetHeight);
};

export const queryVisible = (selector: string): HTMLElement[] => {
  const elements = document.querySelectorAll(selector);
  const visibleElements: HTMLElement[] = [];

  for (let i = 0; i < elements.length; i++) {
    if (isVisible(elements[i] as HTMLElement)) {
      visibleElements.push(elements[i] as HTMLElement);
    }
  }

  return visibleElements;
};

export const locateElement = async ({
  action,
  dataAttribute,
  target,
  timeoutMs
}: LocateElementArgs) => {
  const finalTimeoutMs = timeoutMs || 30000;
  if (dataAttribute && target.dataValue) {
    return waitFor(() =>
      selectTop(queryByData({ action, dataAttribute, dataValue }))
    );
  }

  const match = await waitFor(() => selectTop(queryByAction(action)));
  if (match) return match;

  return selectTop(queryByAction());
};

const queryByAction = (action: Action): HTMLElement[] => {
  const selector = action === "input" ? "input,select,textarea" : "*";

  return queryVisible(selector);
};

const queryByData = ({
  action,
  dataAttribute,
  dataValue
}: QueryByDataArgs): HTMLElement[] => {
  const dataSelector = `[${dataAttribute}='${dataValue}']`;
  if (action === "input") {
    const selector = `input${dataSelector},select${dataSelector},textarea${dataSelector}`;

    return queryVisible(selector);
  }

  return queryVisible(dataSelector);
};

export const waitFor = async (
  getElementFn: () => HTMLElement | null,
  timeoutMs: number,
  sleepMs: number = 500
): Promise<HTMLElement | null> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const element = getElementFn();
    if (element) return element;

    await sleep(sleepMs);
  }

  return null;
};
