import { mockProcessStdout } from 'jest-mock-process';
import { repl as createRepl, Repl } from '../../src/repl/Repl';

describe('repl', () => {
  let repl: Repl;
  let resolved = false;
  let mockedStdout: jest.SpyInstance = mockProcessStdout();

  beforeAll(() => {
    createRepl({}, created => (repl = created)).then(() => (resolved = true));
  });

  afterAll(() => {
    mockedStdout.mockRestore();
  });

  test('opens a repl', () => {
    const messages: string[] = mockedStdout.mock.calls.map(args => args[0]);

    expect(
      messages.find((m: string) => m.includes('Type .exit to close the repl')),
    ).toBeTruthy();

    expect(messages).toContain('> ');
  });

  test('resolves after resume() is called', async () => {
    expect(resolved).toEqual(false);
    repl.close();
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
