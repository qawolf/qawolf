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

export const setInputValue = (
  element: HTMLInputElement,
  value: string | null = null
) => {
  element.value = value || "";
};
