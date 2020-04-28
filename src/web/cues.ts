import { getAttribute } from './attribute';
import { isDynamic } from './isDynamic';

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

type CueType = typeof CueTypes[number];

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

export type Selector = {
  name: 'css' | 'text';
  body: string;
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

const buildCuesForElement = ({
  attributes,
  element,
  isClick,
  level,
}: BuildCuesForElement): Cue[] => {
  const cues: Cue[] = [];

  cues.push(...buildAttributeCues({ attributes, element, level }));
  cues.push(
    ...buildAttributeCues({
      attributes: [...CSS_ATTRIBUTES],
      element,
      level,
      useAttributeName: true,
    }),
  );
  cues.push(...buildTextCues({ element, isClick, level }));

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

const buildCueValueForTag = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();
  if (!element.parentElement) return tagName;

  const siblings = element.parentElement.children;
  const sameTagSiblings: HTMLElement[] = [];

  for (let sibling of siblings) {
    if (sibling.tagName.toLowerCase() === tagName) {
      sameTagSiblings.push(sibling as HTMLElement);
    }
  }

  if (sameTagSiblings.length < 2) {
    return tagName;
  }

  const nthIndex = sameTagSiblings.indexOf(element) + 1;

  return `${tagName}:nth-of-type(${nthIndex})`;
};

export const buildSelectorForCues = (cues: Cue[]): Selector[] => {
  const levels = [...new Set(cues.map((cue) => cue.level))];
  levels.sort().reverse();

  const selector: Selector[] = [];

  levels.forEach((level) => {
    const cuesForLevel = cues.filter((cue) => cue.level === level);

    const textCues = cuesForLevel.filter((cue) => cue.type === 'text');
    if (textCues.length) {
      selector.push({ name: 'text', body: textCues[0].value });
      return;
    }

    cuesForLevel.sort((a, b) => {
      if (a.type === 'tag') return -1;
      if (b.type === 'tag') return 1;
      return 0;
    });

    const bodyValues = cuesForLevel.map((cue) => cue.value);

    selector.push({ name: 'css', body: bodyValues.join('') });
  });

  return selector;
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
    (element.type === 'submit' || element.type === 'button')
  )
    text = element.value;

  if (text.length > 200 || text.match(/[\n\r\t]+/)) return [];

  return [{ level, type: 'text', value: JSON.stringify(text) }];
};
