import htmlTags from 'html-tags';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require('an-array-of-english-words/index.json');

type ValueMatchSelectorType =
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'equals';

type ValueMatchOperator =
  | '^='
  | '$='
  | '*='
  | '=';

type ValueMatchSelector = {
  match: string;
  operator: ValueMatchOperator;
  type: ValueMatchSelectorType;
  startPosition: number;
};

const matchOperators = new Map<ValueMatchSelectorType, ValueMatchOperator>([
  ['startsWith', '^='],
  ['endsWith', '$='],
  ['contains', '*='],
  ['equals', '='],
]);

// Keep these two in sync
const SPLIT_CHARACTERS = [' ', '-', '_', ':'];
const SPLIT_REGEXP = /[ \-_:]+/;

const allWords = new Set([
  'btn',
  'checkbox',
  'dropdown',
  // favicon
  'fa',
  'grid',
  'inputtext',
  'lg',
  'login',
  'logout',
  // medium
  'md',
  // material ui
  'mui',
  'nav',
  'signin',
  'signout',
  'signup',
  'sm',
  'textinput',
  'todo',
  ...htmlTags,
  ...englishWords,
]);

// remove the alphabet from word list
for (let i = 0; i < 26; i++) allWords.delete((i + 10).toString(36));

const SCORE_THRESHOLD = 0.5;

export const getTokens = (value: string): string[] => {
  const tokens = [];

  // split by space, dash, underscore, colon
  value.split(SPLIT_REGEXP).forEach((token) => {
    if (token.match(/\d/)) {
      tokens.push(token);
    } else {
      // split by camel case when there are no numbers
      tokens.push(...token.split(/(?=[A-Z])/));
    }
  });

  return tokens.map((token) => token.toLowerCase());
};

export const tokenIsDynamic = (value: string): boolean => {
  return !allWords.has(value);
};

export const isDynamic = (
  value: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!value || typeof value !== 'string') return true;

  const tokens = getTokens(value);

  const dynamicTokens = tokens.filter(tokenIsDynamic);

  // if there are 2 or more dynamic tokens, mark it as dynamic
  if (dynamicTokens.length >= 2) return true;

  // If half or more tokens are dynamic, mark value as dynamic
  return dynamicTokens.length / tokens.length >= threshold;
};

export const getValueMatchSelector = (
  value: string,
): ValueMatchSelector | null => {
  if (!value || typeof value !== 'string' || value.length === 0) return null;

  const tokens = getTokens(value);

  let currentPosition = 0;
  let currentSubstring = '';
  let blockCount = 0;
  let lastTokenType: string;
  let longestSubstring = '';
  let longestSubstringStart = 0;
  let type: ValueMatchSelectorType;

  const checkLongest = (isEnd = false): void => {
    if (currentSubstring.length > longestSubstring.length) {
      longestSubstring = currentSubstring;
      longestSubstringStart = currentPosition - currentSubstring.length;

      if (longestSubstringStart === 0) {
        type = 'startsWith';
      } else {
        const lastCharOfPreviousBlock = value[longestSubstringStart - 1];
        if (SPLIT_CHARACTERS.includes(lastCharOfPreviousBlock)) {
          longestSubstring = lastCharOfPreviousBlock + longestSubstring;
          longestSubstringStart = longestSubstringStart - 1;
        }
        type = isEnd ? 'endsWith' : 'contains';
      }
    }
    currentSubstring = '';
  };

  for (const token of tokens) {
    const tokenType = tokenIsDynamic(token) ? 'dynamic' : 'static';

    if (blockCount === 0 || tokenType !== lastTokenType) {
      blockCount += 1;
    }

    if (tokenType === 'dynamic' && lastTokenType === 'static') {
      checkLongest();
    }

    if (tokenType === 'static') currentSubstring += value.substr(currentPosition, token.length);
    currentPosition += token.length;

    // Add back in the split-by character
    const nextCharacter = value[currentPosition];
    if (SPLIT_CHARACTERS.includes(nextCharacter)) {
      if (tokenType === 'static') currentSubstring += nextCharacter;
      currentPosition += 1;
    }

    lastTokenType = tokenType;
  }

  if (blockCount === 1) {
    // Entire string was dynamic, so we can't match on any part of it
    if (lastTokenType === 'dynamic') return null;

    // Entire string was static, so we can match the whole thing
    longestSubstring = value;
    longestSubstringStart = 0;
    type = 'equals';
  } else if (lastTokenType === 'static') {
    // Do final check for longest if last token type was static
    checkLongest(true);
  }

  const selectorInfo = {
    match: longestSubstring,
    operator: matchOperators.get(type),
    type,
    startPosition: longestSubstringStart,
  };

  console.debug('selector info for "%s": %j', value, selectorInfo);

  return selectorInfo;
};
