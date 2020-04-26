const englishWords = require('an-array-of-english-words');

const allowedWords = englishWords.push(
  ...[
    'btn',
    'nav',
    'div',
    'login',
    'logout',
    'signin',
    'signout',
    'signup',
    'dropdown',
    'col',
    'todo',
    'inputtext',
    'textinput',
    'sm',
    'lg',
    'svg',
    'fa',
    'img',
  ],
);

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

  const includedWords = classWords.filter((word) => {
    return allowedWords.includes(word);
  });

  const score = includedWords.length / classWords.length;

  return score < threshold;
};
