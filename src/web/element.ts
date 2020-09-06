import { getXpath } from './serialize';

export const isVisible = (
  element: Element,
  computedStyle?: CSSStyleDeclaration,
): boolean => {
  const htmlElement = element as HTMLElement;
  if (htmlElement.offsetWidth <= 0 || htmlElement.offsetHeight <= 0) {
    return false;
  }

  if (computedStyle && computedStyle.visibility === 'hidden') {
    return false;
  }

  if (computedStyle && computedStyle.display === 'none') {
    return false;
  }

  return true;
};

export const isClickable = (
  element: HTMLElement,
  computedStyle: CSSStyleDeclaration,
): boolean => {
  // assume it is clickable if the cursor is a pointer
  const clickable = computedStyle.cursor === 'pointer';

  return clickable && isVisible(element, computedStyle);
};

/**
 * @summary Sometimes there is a group of elements that together make up what appears
 *   to be a single button, link, image, etc. Examples: a > span | button > div > span
 *   For these we want to take into consideration the entire "clickable group" when
 *   building a good selector. The topmost clickable (a | button | input) should be
 *   preferred in many cases, but if an inner element has a lower-penalty attribute
 *   then that should be preferred.
 *
 * @return An array of HTMLElement that make up the clickable group. If `element`
 *   itself is not clickable, the array is empty.
 */
export const getClickableGroup = (element: HTMLElement): HTMLElement[] => {
  console.debug('qawolf: get clickable ancestor for', getXpath(element));

  const clickableElements = [];
  let checkElement = element;

  while (isClickable(checkElement, window.getComputedStyle(checkElement))) {
    clickableElements.push(checkElement);

    if (['a', 'button', 'input'].includes(checkElement.tagName.toLowerCase())) {
      // stop crawling when the checkElement is a good clickable tag
      break;
    }

    checkElement = checkElement.parentElement;

    // stop crawling at the root
    if (!checkElement) break;
  }

  return clickableElements;
};

/**
 * @summary Returns the topmost isContentEditable ancestor. Editable areas can
 *   have HTML elements in them, and these elements emit events, but in general
 *   I don't think we want to keep track of anything within the editable area.
 *   For example, if you click a particular paragraph in a `contenteditable`
 *   div, we should just record it as a click/focus of the editable div.
 */
export const getTopmostEditableElement = (
  element: HTMLElement,
): HTMLElement => {
  if (!element.isContentEditable) return element;

  console.debug('qawolf: get editable ancestor for', getXpath(element));

  let ancestor = element;
  do {
    if (!ancestor.parentElement || !ancestor.parentElement.isContentEditable) {
      console.debug(
        `qawolf: found editable ancestor: ${ancestor.tagName}`,
        getXpath(ancestor),
      );
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  } while (ancestor);

  // This should never be hit, but here as a safety
  return element;
};

/**
 * @summary Returns the best target element for reproducing a mouse event.
 */
export const getMouseEventTarget = (event: MouseEvent): HTMLElement => {
  const originalTarget = event.target as HTMLElement;

  const clickableGroup = getClickableGroup(originalTarget);

  // If originalTarget wasn't part of a clickable group
  if (clickableGroup.length === 0) {
    return getTopmostEditableElement(originalTarget);
  }

  // For now, just return the topmost clickable element in the group
  return clickableGroup[clickableGroup.length - 1];
};

/**
 * @summary Returns the current "value" of an element. Pass in an event `target`.
 *   For example, returns the `.value` or the `.innerText` of a content-editable.
 *   If no value can be determined, returns `null`.
 */
export const getInputElementValue = (
  element: HTMLInputElement,
): string | null => {
  // In the wild, we've seen examples of input elements with `contenteditable=true`,
  // but an `input` never has inner text, so we check for `input` tag name here.
  if (element.isContentEditable && element.tagName.toLowerCase() !== 'input') {
    return element.innerText;
  }

  return element.value || null;
};
