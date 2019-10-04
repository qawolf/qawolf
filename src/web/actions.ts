import { sleep } from "../utils";

export const click = (element: HTMLElement) => {
  const clickableElement = findClickableAncestor(element);

  // simulate full click
  // https://javascript.info/mouse-events-basics
  const eventOptions = { bubbles: true };
  clickableElement.dispatchEvent(new MouseEvent("mousedown", eventOptions));
  clickableElement.dispatchEvent(new MouseEvent("mouseup", eventOptions));
  clickableElement.dispatchEvent(new MouseEvent("click", eventOptions));
};

const findClickableAncestor = (element: HTMLElement): HTMLElement => {
  if (element.click) return element;
  if (!element.parentElement) {
    throw `Element ${element} does not have parent`;
  }

  return findClickableAncestor(element.parentElement);
};

export const scrollTo = async (
  yPosition: number,
  timeoutMs: number = 10000
) => {
  const start = Date.now();

  while (window.pageYOffset !== yPosition) {
    if (Date.now() - start > timeoutMs) {
      throw "Could not scroll, timeout exceeded";
    }

    await sleep(100);
    window.scrollTo(0, yPosition);
  }
};

export const setInputValue = (
  element: HTMLInputElement,
  value: string | null = null
) => {
  element.value = value || "";
  // ensure change event fired
  const changeEvent = new Event("change", { bubbles: true });
  element.dispatchEvent(changeEvent);
};
