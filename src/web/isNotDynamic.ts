const englishWords = require('an-array-of-english-words');

const allowedWords = englishWords.push(
  ...[
    'btn',
    'nav',
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
  ],
);

const SCORE_THRESHOLD = 0.5;

export const getWords = (className: string): string[] => {
  const classWords = [];

  className.split(/[ \-_]+/).forEach((word) => {
    if (!word) return;

    word.split(/(?=[A-Z])/).forEach((nestedWord) => {
      if (!nestedWord) return;
      classWords.push(nestedWord.toLowerCase());
    });
  });

  return classWords;
};

export const isNotDynamic = (
  className: string,
  threshold = SCORE_THRESHOLD,
): boolean => {
  if (!className) return false;

  const classWords = getWords(className);
  let wordCount = 0;

  classWords.forEach((word) => {
    if (allowedWords.includes(word)) {
      wordCount++;
    }
  });

  const score = wordCount / classWords.length;

  return score > threshold;
};
