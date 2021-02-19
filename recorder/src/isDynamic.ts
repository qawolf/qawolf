import htmlTags from "html-tags";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require("an-array-of-english-words/index.json");

const SPLIT_REGEXP = /[ \-_:]+/;

const allWords = new Set([
  "btn",
  "checkbox",
  "dropdown",
  // favicon
  "fa",
  "grid",
  "inputtext",
  "lg",
  "login",
  "logout",
  // medium
  "md",
  // material ui
  "mui",
  "nav",
  "signin",
  "signout",
  "signup",
  "sm",
  "textinput",
  "todo",
  // credit card inputs
  "cvc",
  // companies
  "paypal",
  ...htmlTags,
  ...englishWords,
]);

// remove the alphabet from word list
for (let i = 0; i < 26; i++) allWords.delete((i + 10).toString(36));

function splitCamelCaseWithAbbreviations(text: string) {
  return text.split(/([A-Z][a-z]+)/).filter((val: string) => val.length);
}

export const getTokens = (value: string): string[] => {
  const tokens = [];

  // split by space, dash, underscore, colon
  value.split(SPLIT_REGEXP).forEach((token) => {
    if (token.match(/\d/)) {
      tokens.push(token);
    } else {
      // split by camel case when there are no numbers
      tokens.push(...splitCamelCaseWithAbbreviations(token));
    }
  });

  return tokens.map((token) => token.toLowerCase());
};

/**
 * @summary Given an attribute value, breaks it apart into pieces/words, and
 *   then determines how many pieces are dynamically generated.
 * @param {String} value The attribute value to check
 * @return {Boolean} If two or more pieces are dynamic, or if 1 out of 2 pieces
 *   or 1 out of 1 piece are dynamic, returns true. Also returns `true` if
 *   `value` is not a string.
 */
export const isDynamic = (value: string): boolean => {
  if (!value || typeof value !== "string") return true;

  const tokens = getTokens(value);

  let words = 0;
  let numbers = 0;
  let mixed = 0;

  tokens.forEach((token) => {
    if (allWords.has(token)) words += 1;
    else if (!isNaN(Number(token))) numbers += 1;
    else if (/\d/.test(token)) mixed += 1;
  });

  // allow numbers if the other tokens are words
  if (words + numbers === tokens.length) return false;

  // If half or more tokens are dynamic, mark value as dynamic
  return (words - mixed) / tokens.length <= 0.5;
};
