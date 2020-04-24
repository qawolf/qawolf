// tag: include n-th of child
// text: include innerText if clickable

import { getXpath } from './xpath';

type Cue = {
  level: 'ancestor' | 'target';
  type: 'aria-label' | 'attribute' | 'class' | 'tag' | 'text';
  value: string;
};

type Selector = {
  name: 'css' | 'text';
  body: string;
};

export const findTarget = (target: HTMLElement) => {
  // ex. clickable ancestor...
  return target;
};

class CueGroupIterator {
  _cues: Cue[];

  constructor(cues: Cue[]) {
    this._cues = cues;
  }

  // TODO attribute, then...
  // TODO getRank()

  // const attributeCues = cues.filter((cue) => cue.type === 'attribute');
  // for (let attributeCue of attributeCues) {
  //   if (attributeCue.level === "target") buildSelectorForCues([attribtueCue]);
  //   if (selector) return selector;
  // }

  // const targetCues = buildCues(target);
  // for (let cue of attributeCues) {
  //   for (let targetCue of )
  //   let selector = buildSelector(cue)
  // }

  // try each target selector

  // in order of ancestor rank, try each with target

  hasNext() {
    return true;
  }

  getNext(): Cue[] {
    return [];
    // TODO
  }
}

export const buildCues = (target: HTMLElement) => {
  return [];
};

export const isUnique = (selectors: Selector[]): boolean => {
  // const elements = evaluator.querySelectorAll(
  //   [
  //     { name: 'css', body: '.FPdoLc.tfB0Bf' },
  //     { name: 'text', body: 'Google Search' },
  //   ],
  //   document.body,
  // );

  return false;
};

export const buildSelectorForCues = (cues: Cue[]): string | null => {
  // TODO combine classes, then everything else with spaces
  //  { name: 'css', body: '' };

  // const body = text.match(/^\s*[a-zA-Z0-9]+\s*$/)
  //   ? text.trim()
  //   : JSON.stringify(text);
  // { name: 'text', body };

  // TODO if not unique return null
  // otherwise combine to a string

  return null;
};

export const findSelector = (originalTarget: HTMLElement): string | null => {
  let selector: string | null = null;

  const target = findTarget(originalTarget);
  const cues = buildCues(target);

  const iterator = new CueGroupIterator(cues);

  do {
    const cues = iterator.getNext();

    selector = buildSelectorForCues(cues);
  } while (!selector && iterator.hasNext());

  if (!selector) {
    selector = getXpath(originalTarget);
  }

  return selector;
};
