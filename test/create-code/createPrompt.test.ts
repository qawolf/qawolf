import { createPrompt } from '../../src/create-code/createPrompt';
import { WatchHooks } from '../../src/watch/WatchHooks';

const KEYS = {
  down: '\u001b[B',
};

describe('createPrompt', () => {
  it('discard resolve false', async () => {
    const promise = createPrompt('');
    process.stdin.push(KEYS.down);
    process.stdin.push(KEYS.down);
    process.stdin.push('\n');
    await expect(promise).resolves.toEqual(false);
  });

  it('save resolve true', async () => {
    const promise = createPrompt('');
    process.stdin.push('\n');
    await expect(promise).resolves.toEqual(true);
  });

  it('test stopped resolves null', async () => {
    const spy = jest
      .spyOn(WatchHooks, 'onStop')
      // call onStop immediately
      .mockImplementation((callback) => callback());

    await expect(createPrompt('')).resolves.toEqual(null);

    // close the prompt to prevent open handles
    process.stdin.push('\n');

    spy.mockRestore();
  });
});
