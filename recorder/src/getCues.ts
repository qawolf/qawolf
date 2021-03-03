import cssEscape from "css.escape";

import { isDynamic } from "./isDynamic";
import { Cue } from "./types";

const PENALTY_MAP = {
  alt: 20,
  "aria-label": 8,
  class: 12,
  // High penalty because it is unlikely to be unique given that the value is always the same
  contenteditable: 30,
  // prefer test attributes
  "data-cy": 0,
  "data-e2e": 0,
  "data-qa": 0,
  for: 5,
  href: 15,
  id: 5,
  name: 10,
  placeholder: 10,
  role: 20,
  src: 15,
  tag: 40,
  text: 10,
  title: 10,
  type: 20,
  value: 10,
};

/**
 * Get the element's cues in ascending penalty
 */
export function getCues(element: HTMLElement, level: number): Cue[] {
  const tagValue = getTagValue(element);

  const cues: Cue[] = [
    {
      level,
      penalty: PENALTY_MAP.tag,
      type: "tag",
      value: tagValue,
    },
  ];

  // For body and html, we never have more than one, so
  // just 'tag' cue is needed and we can save some time.
  if (["html", "body"].includes(tagValue)) {
    cues[0].penalty = 0;
    return cues;
  }

  const attributes = element.attributes;

  for (let i = 0; i < attributes.length; i++) {
    let { name, value } = attributes[i];

    let penalty = PENALTY_MAP[name];

    // prefer test attributes
    if (name.match(/^data-test.*/) || name.match(/^qa-.*/)) penalty = 0;

    if (penalty === undefined) {
      //
      console.debug("qawolf: ignore attribute with unknown penalty", name);
      continue;
    }

    if (
      // allow dynamic values for test and allowlist attributes
      penalty !== 0 &&
      !["placeholder", "href", "src", "value"].includes(name) &&
      isDynamic(value)
    ) {
      // ignore dynamic attribute
      continue;
    }

    const isId = name === "id";
    cues.push({
      level,
      penalty,
      type: isId ? "id" : "attribute",
      value: isId ? `#${cssEscape(value)}` : `[${name}="${cssEscape(value)}"]`,
    });
  }

  element.classList.forEach((className) => {
    if (isDynamic(className)) {
      console.debug("qawolf: ignore dynamic class", className);
      return;
    }

    cues.push({
      level,
      penalty: PENALTY_MAP.class,
      type: "class",
      value: `.${cssEscape(className)}`,
    });
  });

  return cues.sort((a, b) => a.penalty - b.penalty);
}

export const getTagValue = (element: HTMLElement): string => {
  const value = element.tagName.toLowerCase();
  if (!element.parentElement) return value;

  const siblings = element.parentElement.children;
  const sameTagSiblings: HTMLElement[] = [];

  for (const sibling of siblings) {
    if (sibling.tagName.toLowerCase() === value) {
      sameTagSiblings.push(sibling as HTMLElement);
    }
  }

  if (sameTagSiblings.length < 2) return value;

  const nthIndex = sameTagSiblings.indexOf(element) + 1;
  if (nthIndex === 1) return value;

  return `${value}:nth-of-type(${nthIndex})`;
};
