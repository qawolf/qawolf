import { ElementHandle } from 'playwright';

export const TEST_URL = process.env.TEST_URL || 'http://localhost:5000/';

export const KEYS = {
  down: '\u001b[B',
  enter: '\n',
};

// https://gist.github.com/6174/6062387
export const randomString = (): string =>
  Math.random().toString(36).substring(2, 15);

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
