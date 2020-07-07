// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require('an-array-of-english-words/index.json');

const layoutWords = ['col', 'fa', 'grid'];

const allowedWords = new Set([
  'btn',
  'div',
  'dropdown',
  'html',
  'img',
  'inputtext',
  'lg',
  'li',
  'login',
  'logout',
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
  ...layoutWords,
  ...englishWords,
]);

const SCORE_THRESHOLD = 0.5;

export const getWords = (value: string): string[] => {
  const classWords = [];
  // split by space characters and camel case
  value.split(/[ \-_]+|(?=[A-Z])/).forEach((word) => {
    if (!word) return; // ignore empty string

    classWords.push(word.toLowerCase());
  });

  return classWords;
};

export const isDynamic = (
  value: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!value) return true;

  const classWords = getWords(value);

  // dynamic if there is more than 1 digit and it does not include a layout word
  const digits = (value.match(/\d+/g) || []).join('').length;
  if (digits > 1 && !layoutWords.find((word) => classWords.includes(word))) {
    return true;
  }

  const includedWords = classWords.filter((word) => allowedWords.has(word));
  // dynamic if more than two non-included words
  if (classWords.length - includedWords.length >= 2) return true;

  return includedWords.length / classWords.length <= threshold;
};
