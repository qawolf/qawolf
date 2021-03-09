import { ElementDescriptor, getDescriptor } from "./element";
import { Rect } from "./types";

export const CLICK_TYPES =
  "a,button,input,label,textarea,[contenteditable=true],[role=button],[role=checkbox],[role=radio]";

const MATCH_POSITION_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "image",
  "radio",
  "reset",
  "submit",
]);

export function allowPositionMatch(target: ElementDescriptor): boolean {
  if (target.isContentEditable || target.tag === "textarea") return false;

  return (
    target.tag !== "input" || MATCH_POSITION_INPUT_TYPES.has(target.inputType)
  );
}

export function isElementMatch(
  element: HTMLElement,
  target: HTMLElement,
  cache: Map<HTMLElement, Rect>
): boolean {
  if (element === target) return true;
  if (!allowPositionMatch(getDescriptor(target))) return false;

  // make sure the elements in are in the same tree
  // ex. a modal might be on top but we don't want
  // to consider the element behind it as a match
  const isSameTree = target.contains(element) || element.contains(target);
  if (!isSameTree) return false;

  // check the middle of the element is within the target
  let targetRect = cache.get(target);
  if (!targetRect) {
    targetRect = target.getBoundingClientRect();
    cache.set(target, targetRect);
  }

  let elementRect = cache.get(element);
  if (!elementRect) {
    elementRect = element.getBoundingClientRect();
    cache.set(element, elementRect);
  }

  if (!isWithin(elementRect, targetRect)) return false;

  // make sure the element is within the same click boundary
  // ex. we don't want to click on a button within our target
  const isSameBoundary =
    element.closest(CLICK_TYPES) === target.closest(CLICK_TYPES);

  return isSameBoundary;
}

/**
 * Check the middle point of other is within the container.
 * Since that is what will be clicked on.
 */
export function isWithin(other: Rect, container: Rect): boolean {
  const middle = {
    x: other.x + other.width / 2,
    y: other.y + other.height / 2,
  };

  return (
    container.x <= middle.x &&
    middle.x <= container.x + container.width &&
    container.y <= middle.y &&
    middle.y <= container.y + container.height
  );
}
