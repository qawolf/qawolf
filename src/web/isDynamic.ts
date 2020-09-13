import htmlTags from 'html-tags';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const englishWords = require('an-array-of-english-words/index.json');

type ValueMatchOperatorType =
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'equals';

type ValueMatchOperator =
  | '^='
  | '$='
  | '*='
  | '=';

type ValueMatch = {
  match: string;
  operator: ValueMatchOperator;
  type: ValueMatchOperatorType;
  startPosition: number;
};

const matchOperators = new Map<ValueMatchOperatorType, ValueMatchOperator>([
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

/**
 * @summary Given an attribute value, determines the best ways to match on only
 *   the pieces of it that appear to be static (regular words that don't seem
 *   to be dynamically generated).
 *
 *   Examples:
 *
 *     - For 'input-bj84jd9' it will suggest a starts-with match on `input-`
 *     - For 'bj84jd9-input' it will suggest an ends-with match on `-input`
 *     - For '25-input-bj84jd9' it will suggest a contains match on `-input-`
 *     - For 'bj84jd9' it will return `null` because the whole value is dynamic
 *     - For '', null, or undefined it will return `null`
 *     - For 'input-25-red-bj84jd9' it will suggest two matches: a starts-with
 *         match on `input-` and a contains match on `-red-`.
 *
 *  @param {String|null|undefined} value The attribute value to examine
 *  @return {Object[]} List of possible value matches, empty if no static pieces are found
 */
export const getValueMatches = (
  value: string,
): ValueMatch[] => {
  if (!value || typeof value !== 'string' || value.length === 0) return [];

  // Break the value into tokens, each of which may be words, numbers, or something else.
  const tokens = getTokens(value);

  let currentPosition = 0;
  let currentStaticBlock = '';
  let lastTokenType: string;
  const staticMatches: ValueMatch[] = [];

  const addMatchToList = (): void => {
    const startPosition = currentPosition - currentStaticBlock.length;

    // Determine what type of match this would be
    let type: ValueMatchOperatorType;
    if (currentStaticBlock.length === value.length) {
      type = 'equals';
    } else if (startPosition === 0) {
      type = 'startsWith';
    } else if (currentPosition === value.length) {
      type = 'endsWith';
    } else {
      type = 'contains';
    }

    staticMatches.push({
      match: currentStaticBlock,
      operator: matchOperators.get(type),
      type,
      startPosition,
    });
  };

  // There may be multiple dynamic tokens in a row or multiple static in a row.
  // What we care about is the "token blocks", which is each group of same-type
  // tokens. Thus we loop through, checking the type of each, and taking action
  // only when we switch between types.
  for (const token of tokens) {
    const tokenType = tokenIsDynamic(token) ? 'dynamic' : 'static';

    // Whenever we finish a static block, add it to the list.
    if (tokenType === 'dynamic' && lastTokenType === 'static') {
      addMatchToList();
    } else if (tokenType === 'static' && lastTokenType === 'dynamic') {
      // When we start a new static block after a dynamic block, reset the current
      // block string, and potentially add all preceding split characters to it.
      currentStaticBlock = '';
      let backwardPosition = currentPosition - 1;
      let previousCharacter = value[backwardPosition];
      while (SPLIT_CHARACTERS.includes(previousCharacter)) {
        currentStaticBlock = previousCharacter + currentStaticBlock;
        backwardPosition -= 1;
        previousCharacter = value[backwardPosition];
      }
    }

    // Add only static tokens to the end of the current static block string.
    // We are re-combining static tokens that were pieced apart by `getTokens`.
    // We could just append the token string itself, but it has been lowercased.
    if (tokenType === 'static') {
      currentStaticBlock += value.substr(currentPosition, token.length);
    }

    // Keep track of where we are in the original value string
    currentPosition += token.length;

    // Add back in any split-by characters
    let nextCharacter = value[currentPosition];
    while (SPLIT_CHARACTERS.includes(nextCharacter)) {
      if (tokenType === 'static') currentStaticBlock += nextCharacter;
      currentPosition += 1;
      nextCharacter = value[currentPosition];
    }

    lastTokenType = tokenType;
  }

  // Do final check for longest if last token type was static
  if (lastTokenType === 'static') addMatchToList();

  console.debug('value matches for "%s": %j', value, staticMatches);

  return staticMatches;
};
