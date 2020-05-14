import { createPrompt, KEYS } from '../../src/create-code/createPrompt';

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
