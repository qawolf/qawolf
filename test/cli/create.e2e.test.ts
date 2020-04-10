import { spawn, ChildProcess } from 'child_process';
import { readFile, readJson, pathExists } from 'fs-extra';
import { join } from 'path';
import { BrowserServer } from 'playwright';
import { launchServer } from '../browser';
import { CDPSession } from './CDPSession';
import { KEYS } from '../../src/create-code/createPrompt';
import { waitFor } from '../../src/utils';
import { sleep } from '../utils';

// help us debug flakes
process.env.DEBUG = 'qawolf*';

const testPath = join(__dirname, '../.qawolf/example.test.ts');
const selectorsPath = join(testPath, '../selectors/example.json');

const loadCode = async (): Promise<string> => {
  if (!(await pathExists(testPath))) return null;
  const code = await readFile(testPath, 'utf8');
  if (!code.length) return null;
  return code;
};

describe('npx qawolf create', () => {
  let child: ChildProcess;
  let stdout = '';

  let server: BrowserServer;

  beforeAll(async () => {
    server = await launchServer();

    child = spawn('node', ['node_modules/qawolf/build/index.js', 'create'], {
      env: { ...process.env },
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      console.log('stderr:', chunk);
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      console.log('stdout:', chunk);
      stdout += chunk;
    });
  });

  afterAll(async () => {
    await server.close();
  });

  it('creates the code file with the custom template', async () => {
    const code = await waitFor(loadCode);
    expect(code).toMatchSnapshot();
  });

  it('creates the selectors file', async () => {
    await waitFor(() => pathExists(selectorsPath));
    expect(await readJson(selectorsPath)).toEqual({});
  });

  it('opens the cli prompt', async () => {
    await waitFor(() => stdout.includes('Save'));
    expect(stdout).toContain('Save and exit');
    expect(stdout).toContain('Discard and exit');
  });

  it('converts actions to code', async () => {
    const targetId = stdout.match(/(?<=targetId=").*?(?=")/)[0];
    const session = await CDPSession.connect(server.wsEndpoint(), targetId);

    // give a little time for event collector to connect
    await sleep(5000);

    await session.send({
      method: 'Input.dispatchMouseEvent',
      params: {
        type: 'mouseWheel',
        deltaX: 0,
        deltaY: 2000,
        x: 0,
        y: 0,
      },
    });

    await waitFor(async () => {
      const code = await loadCode();
      return code && code.includes('qawolf.scroll');
    });

    const code = await loadCode();
    expect(code).toContain('qawolf.scroll');
  });

  describe('discard', () => {
    it('exits the process', async () => {
      const exitPromise = new Promise((resolve) =>
        child.on('exit', (code) => resolve(code)),
      );

      child.stdin.write(KEYS.down);
      child.stdin.write(KEYS.down);
      child.stdin.write(KEYS.enter);

      const code = await exitPromise;
      expect(code).toEqual(0);
    });
  });
});
