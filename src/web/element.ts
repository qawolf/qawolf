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

export const getClickableAncestor = (element: HTMLElement): HTMLElement => {
  /**
   * Crawl up until we reach the top "clickable" ancestor.
   * If the target is the descendant of "a"/"button"/"input" or a clickable element choose it.
   * Otherwise choose the original element as the target.
   */
  let ancestor = element;
  console.debug('qawolf: get clickable ancestor for', getXpath(element));

  while (ancestor.parentElement) {
    if (['a', 'button', 'input'].includes(ancestor.tagName.toLowerCase())) {
      // stop crawling when the ancestor is a good clickable tag
      console.debug(
        `qawolf: found clickable ancestor: ${ancestor.tagName}`,
        getXpath(ancestor),
      );
      return ancestor;
    }

    if (
      !isClickable(
        ancestor.parentElement,
        window.getComputedStyle(ancestor.parentElement),
      )
    ) {
      // stop crawling at the first non-clickable element
      console.debug('qawolf: found clickable ancestor', getXpath(ancestor));
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  // stop crawling at the root
  console.debug('qawolf: found clickable ancestor', getXpath(ancestor));

  return ancestor;
};
