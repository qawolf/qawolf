export const getDataValue = (
  element: HTMLElement,
  dataAttribute: string | null
): string | null => {
  if (!dataAttribute) return null;

  return element.getAttribute(dataAttribute) || null;
};

export const isClickable = (
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration
) => {
  // assume it is clickable if the cursor is a pointer
  const clickable = computedStyle.cursor === "pointer";
  return clickable && isVisible(element, computedStyle);
};

export const isVisible = (
  element: HTMLElement,
  computedStyle?: CSSStyleDeclaration
): boolean => {
  if (element.offsetWidth <= 0 || element.offsetHeight <= 0) return false;

  if (computedStyle && computedStyle.visibility === "hidden") return false;

  return true;
};
