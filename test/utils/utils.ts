export const TEST_URL = process.env.TEST_URL || 'http://localhost:5000/';

// https://gist.github.com/6174/6062387
export const randomString = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15);
