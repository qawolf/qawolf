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

const SCORE_THRESHOLD = 0.5;

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
 * @summary Given a value string that has already been pieced out,
 *   determines whether it appears to be dynamically generated (random, non-word)
 * @param {String} value The string to check
 * @return {Boolean} True if it appears to be dynamically generated
 */
export const tokenIsDynamic = (value: string): boolean => {
  return !allWords.has(value);
};

/**
 * @summary Given an attribute value, breaks it apart into pieces/words, and
 *   then determines how many pieces are dynamically generated.
 * @param {String} value The attribute value to check
 * @param {Number} [threshold=0.5] Provide a threshold override if necessary
 * @return {Boolean} If two or more pieces are dynamic, or if 1 out of 2 pieces
 *   or 1 out of 1 piece are dynamic, returns true. Also returns `true` if
 *   `value` is not a string.
 */
export const isDynamic = (
  value: string,
  threshold = SCORE_THRESHOLD
): boolean => {
  if (!value || typeof value !== "string") return true;

  const tokens = getTokens(value);

  const dynamicTokens = tokens.filter(tokenIsDynamic);

  // if there are 2 or more dynamic tokens, mark it as dynamic
  if (dynamicTokens.length >= 2) return true;

  // If half or more tokens are dynamic, mark value as dynamic
  return dynamicTokens.length / tokens.length >= threshold;
};
