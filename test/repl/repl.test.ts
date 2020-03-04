import { mockProcessStdout } from 'jest-mock-process';
import { repl as createRepl, Repl } from '../../src/repl/Repl';

let mockedStdout: jest.SpyInstance = mockProcessStdout();

describe('repl', () => {
  let repl: Repl;
  let resolved = false;

  beforeAll(() => {
    createRepl({}, created => (repl = created)).then(() => (resolved = true));
  });

  afterAll(() => {
    mockedStdout.mockRestore();
  });

  it('opens a repl', () => {
    const messages: string[] = mockedStdout.mock.calls.map(args => args[0]);
    expect(messages).toContain('> ');
  });

  it('resolves after resume() is called', async () => {
    expect(resolved).toEqual(false);
    repl.close();
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
