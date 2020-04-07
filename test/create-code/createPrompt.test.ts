import { createPrompt, KEYS } from '../../src/create-code/createPrompt';
import { WatchHooks } from '../../src/watch/WatchHooks';

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

  it('test stopped resolves null', async () => {
    const onStopSpy = jest
      .spyOn(WatchHooks, 'onStop')
      // call onStop immediately
      .mockImplementation((callback) => callback());

    const stdinSpy = jest.spyOn(process.stdin, 'push');

    await expect(createPrompt('')).resolves.toEqual(null);

    // it closes the prompt
    expect(stdinSpy.mock.calls).toHaveLength(1);
    expect(stdinSpy.mock.calls[0][0]).toEqual(KEYS.enter);

    onStopSpy.mockRestore();
    stdinSpy.mockRestore();
  });
});
