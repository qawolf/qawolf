import { isDynamic } from './isDynamic';

type Cue = {
  level: number; // 0 is target, 1 is parent, etc.
  type: 'attribute' | 'class' | 'tag';
  value: string;
};

type Selector = {
  name: 'css' | 'text';
  body: string;
};

type BuildCues = {
  attributes: string[];
  target: HTMLElement;
};

type BuildCuesForElement = {
  attributes: string[];
  element: HTMLElement;
  level: number;
};

export const buildCues = ({ attributes, target }: BuildCues): Cue[] => {
  const cues: Cue[] = [];
  let element: HTMLElement = target;
  let level = 0;

  while (element) {
    cues.push(...buildCuesForElement({ attributes, element, level }));

    element = element.parentElement;
    level += 1;
  }

  return cues;
};

const buildCuesForElement = ({
  attributes,
  element,
  level,
}: BuildCuesForElement): Cue[] => {
  const cues: Cue[] = [];

  // TODO: handle regex attributes
  attributes.forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;

    cues.push({ level, type: 'attribute', value: `[${attribute}="${value}"]` });
  });

  element.classList.forEach((c) => {
    if (isDynamic(c)) return;
    cues.push({ level, type: 'class', value: `.${c}` });
  });

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
    const bodyValues = cuesForLevel.map((cue) => cue.value);

    selector.push({ name: 'css', body: bodyValues.join('') });
  });

  return selector;
};
