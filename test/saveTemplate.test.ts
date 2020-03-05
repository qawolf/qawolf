import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { saveTemplate } from '../src/saveTemplate';

// https://gist.github.com/6174/6062387
const randomString = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15);

describe('saveTemplate', () => {
  it('saves script template', async () => {
    const rootDir = join(tmpdir(), randomString());
    await saveTemplate({ name: 'myScript', rootDir, script: true });

    const fileExists = existsSync(join(rootDir, 'scripts', 'myScript.js'));
    expect(fileExists).toBe(true);
  });

  it('saves test template', async () => {
    const rootDir = join(tmpdir(), randomString());
    await saveTemplate({ name: 'myTest', rootDir });

    const fileExists = existsSync(join(rootDir, 'tests', 'myTest.test.js'));
    expect(fileExists).toBe(true);
  });

  it('saves at default location if rootDir not specified', async () => {
    const rootDir = join(tmpdir(), randomString());
    jest.spyOn(process, 'cwd').mockReturnValue(rootDir);
    await saveTemplate({ name: 'myTest' });

    const fileExists = existsSync(
      join(rootDir, '.qawolf', 'tests', 'myTest.test.js'),
    );
    expect(fileExists).toBe(true);

    jest.restoreAllMocks();
  });
});
