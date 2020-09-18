import { Cue } from './cues';
import { Evaluator, SelectorPart } from './types';

/* eslint-disable @typescript-eslint/no-var-requires */
let evaluator: Evaluator;
try {
  evaluator = require('playwright-evaluator');
} catch (e) {
  // this will only error on server side tests that
  // do not require the evaluator but depend on this file
}

const { createTextSelector, querySelector } = evaluator || {};
/* eslint-enable @typescript-eslint/no-var-requires */

type IsMatch = {
  selectorParts: SelectorPart[];
  target: HTMLElement;
};

export const buildSelectorParts = (cues: Cue[]): SelectorPart[] => {
  const levels = [...new Set(cues.map((cue) => cue.level))];

  // sort descending
  levels.sort((a, b) => b - a);

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

export const getElementText = (element: HTMLElement): string | undefined => {
  return createTextSelector(element);
};

export const isMatch = ({ selectorParts, target }: IsMatch): boolean => {
  // We must pass `target.ownerDocument` rather than `document`
  // because sometimes this is called from other frames.
  const result = querySelector({ parts: selectorParts }, target.ownerDocument);

  return result === target;
};

export const getElementMatchingSelectorParts = (selectorParts: SelectorPart[], root: Node): HTMLElement => {
  return querySelector({ parts: selectorParts }, root);
};
