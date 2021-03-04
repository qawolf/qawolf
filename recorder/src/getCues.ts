// use polyfill since some sites override the CSS.escape
import cssEscape from "css.escape";

import { isDynamic } from "./isDynamic";
import { buildElementText } from "./selectorEngine";
import { Cue } from "./types";

const IGNORE_ATTRIBUTES = new Set(["class", "data-reactid"]);

const PENALTY_MAP = {
  alt: 10,
  "aria-label": 8,
  contenteditable: 10,
  // prefer test attributes
  "data-cy": 0,
  "data-e2e": 0,
  "data-qa": 0,
  for: 5,
  href: 15,
  id: 5,
  name: 10,
  placeholder: 10,
  role: 10,
  src: 15,
  tag: 15,
  text: 10,
  title: 10,
  type: 10,
  // TODO only allow this for certain element types (select, radio, etc)
  value: 10,
  // penalize presentation attributes
  // discount classes so 1 is worse than 2 placeholders
  // since they are oftten presentational
  class: 21,
  height: 100,
  viewBox: 100,
  width: 100,
  xmlns: 100,
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

  if (level === 0) {
    const text = buildElementText(element);
    if (text) {
      // only get the target (level 0) text since it is expensive to calculate
      // usually that is the only one we care to target as well
      cues.push({
        level,
        penalty: PENALTY_MAP.text,
        type: "text",
        value: text,
      });
    }
  }

  // For body and html, we never have more than one, so
  // just 'tag' cue is needed and we can save some time.
  if (["html", "body"].includes(tagValue)) {
    cues[0].penalty = 0;
    return cues;
  }

  const attributes = element.attributes;

  for (let i = 0; i < attributes.length; i++) {
    let { name, value } = attributes[i];
    if (IGNORE_ATTRIBUTES.has(name)) continue;

    // rank unknown attributes the same as a class
    let penalty = PENALTY_MAP[name] || PENALTY_MAP.class;

    // prefer test attributes
    if (name.match(/^data-test.*/) || name.match(/^qa-.*/)) penalty = 0;

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
      value: isId
        ? `#${cssEscape(value)}`
        : `[${name}="${value.replaceAll('"', `\\"`)}"]`,
    });
  }

  element.classList.forEach((className) => {
    if (isDynamic(className)) return;

    cues.push({
      level,
      penalty: PENALTY_MAP.class,
      type: "class",
      value: `.${cssEscape(className)}`,
    });
  });

  return cues;
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
