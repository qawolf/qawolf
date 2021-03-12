// use polyfill since some sites override the CSS.escape
import cssEscape from "css.escape";

import { isDynamic } from "./isDynamic";
import { buildElementText } from "./selectorEngine";
import { Cue, CueType } from "./types";

const ALLOW_DYNAMIC_ATTRIBUTES = new Set([
  "href",
  "placeholder",
  "src",
  "value",
]);

const ALLOW_VALUE_ATTRIBUTE = {
  input_types: new Set(["button", "checkbox", "radio", "submit"]),
  tags: new Set(["BUTTON", "OPTION"]),
};

const PENALTY_MAP = {
  alt: 10,
  "aria-label": 5,
  contenteditable: 10,
  // prefer test attributes
  "data-cy": 0,
  "data-e2e": 0,
  "data-qa": 0,
  for: 5,
  href: 15,
  id: 8,
  name: 10,
  placeholder: 10,
  role: 10,
  src: 15,
  tag: 15,
  // worse than two tags
  tagnth: 31,
  text: 10,
  title: 10,
  type: 10,
  value: 10,
  // penalize presentation attributes
  // discount classes so 1 is worse than 2 placeholders
  // since they are often presentational
  class: 21,
  height: 100,
  viewBox: 100,
  width: 100,
  xmlns: 100,
};

const SKIP_ATTRIBUTES = new Set(["class", "data-reactid"]);

/**
 * Get the element's cues in ascending penalty
 */
export function getCues(
  element: HTMLElement,
  level: number,
  maxClasses = 5
): Cue[] {
  const cues: Cue[] = [getTagCue(element, level)];

  // For body and html, we never have more than one, so
  // just 'tag' cue is needed and we can save some time.
  if (["HTML", "BODY"].includes(element.tagName)) {
    if (level === 0) cues[0].penalty = 0;
    return cues;
  }

  if (level === 0) {
    // only get the target (level 0) text since it is expensive to calculate
    // usually that is the only one we care to target as well
    const text = buildElementText(element);
    if (text) {
      cues.push({
        level,
        // penalize long text more
        penalty: Math.max(PENALTY_MAP.text, Math.round(text.length / 2)),
        type: "text",
        value: text,
      });
    }
  }

  const attributes = element.attributes;

  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes[i];
    if (
      SKIP_ATTRIBUTES.has(name) ||
      (name === "value" && !allowValueCue(element))
    )
      continue;

    let penalty = PENALTY_MAP[name];

    // rank unknown attributes the same as a class
    if (typeof penalty === "undefined") penalty = PENALTY_MAP.class;

    // prefer test attributes
    if (name.match(/^data-test.*/) || name.match(/^qa-.*/)) penalty = 0;

    if (
      // allow dynamic values for test and allowlist attributes
      penalty !== 0 &&
      !ALLOW_DYNAMIC_ATTRIBUTES.has(name) &&
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

  // atomic css with composed classes can create a tremendous number of combinations
  // limit the included classes to avoid overwhelming the ranking of better combinations
  let includedClasses = 0;
  for (
    let i = 0;
    includedClasses < maxClasses && i < element.classList.length;
    i++
  ) {
    const className = element.classList[i];
    if (isDynamic(className)) continue;

    cues.push({
      level,
      penalty: PENALTY_MAP.class,
      type: "class",
      value: `.${cssEscape(className)}`,
    });

    includedClasses += 1;
  }

  return cues;
}

export const getTagCue = (element: HTMLElement, level: number): Cue => {
  const cue = {
    level,
    penalty: PENALTY_MAP.tag,
    type: "tag" as CueType,
  };

  const value = element.tagName.toLowerCase();
  if (!element.parentElement) {
    return { ...cue, value };
  }

  const siblings = element.parentElement.children;
  const sameTagSiblings: HTMLElement[] = [];

  for (const sibling of siblings) {
    if (sibling.tagName.toLowerCase() === value) {
      sameTagSiblings.push(sibling as HTMLElement);
    }
  }
  if (sameTagSiblings.length < 2) return { ...cue, value };

  const nthIndex = sameTagSiblings.indexOf(element) + 1;
  if (nthIndex === 1) return { ...cue, value };

  return {
    ...cue,
    penalty: PENALTY_MAP.tagnth,
    value: `${value}:nth-of-type(${nthIndex})`,
  };
};

export const allowValueCue = (element: HTMLElement): boolean => {
  const tag = element.tagName;

  return (
    ALLOW_VALUE_ATTRIBUTE.tags.has(tag) ||
    (tag === "INPUT" &&
      ALLOW_VALUE_ATTRIBUTE.input_types.has((element as HTMLInputElement).type))
  );
};
