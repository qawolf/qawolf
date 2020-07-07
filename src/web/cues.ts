import { getAttribute } from './attribute';
import { canTargetValue } from './element';
import { isDynamic } from './isDynamic';
import { SelectorPart } from './types';

const DEFAULT_ATTRIBUTE =
  'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/';

// make sure to update CueTypeRank if editing this
const CSS_ATTRIBUTES = [
  'alt',
  'aria-label',
  'contenteditable',
  'for',
  'href',
  'name',
  'placeholder',
  'src',
  'title',
  'value',
] as const;

const CueTypes = [
  ...CSS_ATTRIBUTES,
  'attribute',
  'class',
  'id',
  'tag',
  'text',
] as const;

export type CueType = typeof CueTypes[number];

export type Cue = {
  level: number; // 0 is target, 1 is parent, etc.
  type: CueType;
  value: string;
};

type BuildAttributeCues = {
  attributes: string[];
  element: HTMLElement;
  level: number;
  useAttributeName?: boolean;
};

export type BuildCues = {
  attribute?: string;
  isClick: boolean;
  target: HTMLElement;
};

type BuildCuesForElement = {
  attributes: string[];
  element: HTMLElement;
  isClick: boolean;
  level: number;
};

type BuildTextCues = {
  element: HTMLElement;
  isClick: boolean;
  level: number;
};

export const buildAttributeCues = ({
  attributes,
  element,
  level,
  useAttributeName,
}: BuildAttributeCues): Cue[] => {
  const cues: Cue[] = [];

  attributes.forEach((attribute) => {
    const attributeValuePair = getAttribute({ attribute, element });
    if (!attributeValuePair) return;

    const { name, value } = attributeValuePair;
    const type = (useAttributeName ? name : 'attribute') as CueType;

    cues.push({ level, type, value: `[${name}="${value}"]` });
  });

  return cues;
};

export const buildCueValueForTag = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();
  if (!element.parentElement) return tagName;

  const siblings = element.parentElement.children;
  const sameTagSiblings: HTMLElement[] = [];

  for (const sibling of siblings) {
    if (sibling.tagName.toLowerCase() === tagName) {
      sameTagSiblings.push(sibling as HTMLElement);
    }
  }

  if (sameTagSiblings.length < 2) {
    return tagName;
  }

  const nthIndex = sameTagSiblings.indexOf(element) + 1;
  if (nthIndex === 1) return tagName;

  return `${tagName}:nth-of-type(${nthIndex})`;
};

export const buildTextCues = ({
  element,
  isClick,
  level,
}: BuildTextCues): Cue[] => {
  if (!isClick) return [];

  let text = element.innerText.trim();

  if (
    element instanceof HTMLInputElement &&
    ['button', 'submit'].includes(element.type)
  ) {
    text = element.value;
  }

  if (
    !text ||
    text.length > 200 ||
    text.match(/[\n\r\t]+/) ||
    // ignore invisible characters which look like an empty string but have a length
    // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-32.php
    // https://stackoverflow.com/a/21797208/230462
    text.match(/[^\x20-\x7E]/g)
  )
    return [];

  return [{ level, type: 'text', value: text }];
};

export const buildCuesForElement = ({
  attributes,
  element,
  isClick,
  level,
}: BuildCuesForElement): Cue[] => {
  let cssAttributes = [...CSS_ATTRIBUTES];

  if (!canTargetValue(element)) {
    cssAttributes = cssAttributes.filter((attribute) => attribute !== 'value');
  }

  const cues: Cue[] = [
    ...buildAttributeCues({ attributes, element, level }),
    ...buildAttributeCues({
      attributes: cssAttributes,
      element,
      level,
      useAttributeName: true,
    }),
    ...buildTextCues({ element, isClick, level }),
  ];

  element.classList.forEach((c) => {
    if (isDynamic(c)) return;

    cues.push({ level, type: 'class', value: `.${c}` });
  });

  if (element.id && !isDynamic(element.id)) {
    cues.push({ level, type: 'id', value: `#${element.id}` });
  }

  cues.push({ level, type: 'tag', value: buildCueValueForTag(element) });

  return cues;
};

export const buildCues = ({ attribute, isClick, target }: BuildCues): Cue[] => {
  const attributes = (attribute || DEFAULT_ATTRIBUTE).split(',');

  const cues: Cue[] = [];
  let element: HTMLElement = target;
  let level = 0;

  while (element) {
    cues.push(...buildCuesForElement({ attributes, element, isClick, level }));

    element = element.parentElement;
    level += 1;
  }

  return cues;
};

export const buildSelectorParts = (cues: Cue[]): SelectorPart[] => {
  const levels = [...new Set(cues.map((cue) => cue.level))];
  levels.sort().reverse();

  const parts: SelectorPart[] = [];

  levels.forEach((level) => {
    const cuesForLevel = cues.filter((cue) => cue.level === level);

    const textCues = cuesForLevel.filter((cue) => cue.type === 'text');
    if (textCues.length) {
      parts.push({ name: 'text', body: textCues[0].value });
      return;
    }

    cuesForLevel.sort((a, b) => {
      if (a.type === 'tag') return -1;
      if (b.type === 'tag') return 1;
      return 0;
    });

    const bodyValues = cuesForLevel.map((cue) => cue.value);

    parts.push({ name: 'css', body: bodyValues.join('') });
  });

  return parts;
};
