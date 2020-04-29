import englishWords from 'an-array-of-english-words/index.json';

const allowedWords = new Set([
  ...englishWords,
  'btn',
  'col',
  'div',
  'dropdown',
  'fa',
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
]);

const SCORE_THRESHOLD = 0.5;

export const getWords = (className: string): string[] => {
  const classWords = [];
  // split by space characters and camel case
  className.split(/[ \-_]+|(?=[A-Z])/).forEach((word) => {
    if (!word) return; // ignore empty string

    classWords.push(word.toLowerCase());
  });

  return classWords;
};

export const isDynamic = (
  className: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!className) return true;

  const classWords = getWords(className);

  const includedWords = classWords.filter((word) => allowedWords.has(word));

  const score = includedWords.length / classWords.length;

  return score <= threshold;
};
