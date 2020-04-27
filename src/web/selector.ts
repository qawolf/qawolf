import { combineCues } from './combineCues';
import { buildCues, buildSelectorForCues, BuildCues, Selector } from './cues';
import { querySelectorAll } from './playwrightEvaluator';
import { getXpath } from './serialize';

type IsMatch = {
  selector: Selector[];
  target: HTMLElement;
};

export const buildSelector = (options: BuildCues): string => {
  if (['body', 'html'].includes(options.target.tagName.toLowerCase())) {
    return `${options.target.tagName.toLowerCase()}`;
  }

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

  return `xpath=${getXpath(options.target)}`;
};

export const isMatch = ({ selector, target }: IsMatch): boolean => {
  const result = querySelectorAll(selector, document.body);

  if (result[0] !== target && !target.contains(result[0])) {
    console.error('Selector matches another element', selector, target);
    return false;
  }

  return true;
};

export const toSelectorString = (selector: Selector[]): string => {
  const selectorNames = selector.map((s) => s.name);
  // pure CSS selector
  if (!selectorNames.includes('text')) {
    return selector.map((s) => s.body).join(' ');
  }

  // mixed selector
  return selector
    .map(({ body, name }) => {
      return `${name}=${body}`;
    })
    .join(' >> ');
};
