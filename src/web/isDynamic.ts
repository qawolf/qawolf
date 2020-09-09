// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require('an-array-of-english-words/index.json');

const allWords = new Set([
  'btn',
  'checkbox',
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

// remove the alphabet from word list
for (let i = 0; i < 26; i++) allWords.delete((i + 10).toString(36));

const SCORE_THRESHOLD = 0.5;

export const getTokens = (value: string): string[] => {
  const tokens = [];

  // split by space, dash, underscore, colon
  // split by and camel case. TODO: unless there are numbers
  value.split(/[ \-_:]+|(?=[A-Z])/).forEach((token) => {
    if (!token) return; // ignore empty string

    tokens.push(token.toLowerCase());
  });

  return tokens;
};

export const isDynamic = (
  value: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!value || typeof value !== 'string') return true;

  const tokens = getTokens(value);

  const words = tokens.filter((token) => allWords.has(token));

  // if there are more than 2 non-word tokens, mark it as dynamic
  if (tokens.length - words.length >= 2) return true;

  // if less than half of the tokens are words, mark it as dynamic
  return words.length / tokens.length <= threshold;
};
