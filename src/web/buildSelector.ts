import { combineCues } from './combineCues';
import {
  buildCues,
  buildSelectorForCues,
  isMatch,
  toSelectorString,
} from './cues';
import { getXpath } from './xpath';

export const buildSelector = (target: HTMLElement): string => {
  const cues = buildCues({ attributes: [], target });

  for (const cueGroup of combineCues(cues)) {
    console.log('trying', cueGroup);
    const selector = buildSelectorForCues(cueGroup);

    if (isMatch({ selector, target })) {
      return toSelectorString(selector);
    }
  }

  return getXpath(target);
};
