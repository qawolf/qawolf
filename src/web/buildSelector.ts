import { combineCues } from './combineCues';
import {
  buildCues,
  buildSelectorForCues,
  isMatch,
  toSelectorString,
  BuildCues,
} from './cues';
import { getXpath } from './xpath';

export const buildSelector = (options: BuildCues): string => {
  const cues = buildCues(options);

  for (const cueGroup of combineCues(cues)) {
    console.log('trying', cueGroup);
    const selector = buildSelectorForCues(cueGroup);

    if (isMatch({ selector, target: options.target })) {
      const selectorString = toSelectorString(selector);
      console.log('match', selectorString);
      return selectorString;
    }
  }

  return getXpath(options.target);
};
