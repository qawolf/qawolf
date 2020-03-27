import { mockProcessStdout } from 'jest-mock-process';
import { REPLServer } from 'repl';
import { repl as createRepl } from '../../../src/utils';

const mockedStdout: jest.SpyInstance = mockProcessStdout();

describe('repl()', () => {
  let replServer: REPLServer;
  let resolved = false;

  beforeAll(async () => {
    createRepl({}, (instance) => (replServer = instance)).then(
      () => (resolved = true),
    );
  });

  afterAll(() => {
    mockedStdout.mockRestore();
  });

  it('opens a repl', () => {
    const messages: string[] = mockedStdout.mock.calls.map((args) => args[0]);
    expect(messages).toContain('> ');
  });

  it('resolves after the repl is closed', async () => {
    expect(resolved).toEqual(false);
    replServer.close();
    await new Promise((r) => setTimeout(r, 0));
    expect(resolved).toEqual(true);
  });
});
