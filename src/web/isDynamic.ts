// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require('an-array-of-english-words/index.json');

const allWords = new Set([
  'btn',
  'col',
  'div',
  'dropdown',
  // favicon
  'fa',
  'grid',
  'html',
  'img',
  'inputtext',
  'lg',
  'li',
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
  'svg',
  'textinput',
  'todo',
  'ul',
  ...englishWords,
]);

const SCORE_THRESHOLD = 0.5;

export const getTokens = (value: string): string[] => {
  const tokens = [];

  // split by space, dash, and camel case
  value.split(/[ \-_]+|(?=[A-Z])/).forEach((token) => {
    // remove a numeric or alphabetic suffix
    // ex: btn-1, btn_z -> btn
    const symbol = token.replace(/[-_]+(\d+|\w)$/, '');
    if (!symbol) return; // ignore empty string

    tokens.push(symbol.toLowerCase());
  });

  return tokens;
};

export const isDynamic = (
  value: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!value) return true;

  const tokens = getTokens(value);

  const words = tokens.filter((token) => allWords.has(token));

  // if there are more than 2 non-word tokens, mark it as dynamic
  if (tokens.length - words.length >= 2) return true;

  // if less than half of the tokens are words, mark it as dynamic
  return words.length / tokens.length <= threshold;
};
