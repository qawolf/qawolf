import { createPrompt } from '../../src/create-code/createPrompt';
import { KEYS } from '../utils';

describe('createPrompt', () => {
  it('discard resolve false', async () => {
    const promise = createPrompt('');
    process.stdin.push(KEYS.down);
    process.stdin.push(KEYS.down);
    process.stdin.push(KEYS.enter);
    await expect(promise).resolves.toEqual(false);
  });

  it('save resolve true', async () => {
    const promise = createPrompt('');
    process.stdin.push(KEYS.enter);
    await expect(promise).resolves.toEqual(true);
  });
});
