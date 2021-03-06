import { ElementDescriptor, getDescriptor } from "./element";

export type Rect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

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

export function isMatch(
  element: HTMLElement,
  target: HTMLElement,
  cache: Map<HTMLElement, Rect>
): boolean {
  if (element === target) return true;
  if (!allowPositionMatch(getDescriptor(target))) return false;

  // check if the middle of the element is within the target
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

  const isWithinTarget = isWithin(elementRect, targetRect);
  if (!isWithinTarget) return false;

  // make sure the elements in are in the same tree
  // ex. a modal might be on top but we don't want
  // to consider the element behind it as a match
  return target.contains(element) || element.contains(target);
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
