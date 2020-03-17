import { pathExists } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { saveTemplate } from '../../src/cli/saveTemplate';
import { randomString } from '../utils';

jest.mock('inquirer');

afterAll(jest.restoreAllMocks);

describe('saveTemplate', () => {
  it('saves script template', async () => {
    const rootDir = join(tmpdir(), randomString());
    await saveTemplate({
      name: 'myScript',
      rootDir,
      script: true,
      url: 'www.qawolf.com',
    });

    const fileExists = await pathExists(join(rootDir, 'myScript.js'));
    expect(fileExists).toBe(true);

    const selectorsExists = await pathExists(
      join(rootDir, 'selectors', 'myScript.json'),
    );
    expect(selectorsExists).toBe(true);
  });

  it('saves test template', async () => {
    const rootDir = join(tmpdir(), randomString());
    await saveTemplate({ name: 'myTest', rootDir, url: 'www.qawolf.com' });

    const fileExists = await pathExists(join(rootDir, 'myTest.test.js'));
    expect(fileExists).toBe(true);

    const selectorsExists = await pathExists(
      join(rootDir, 'selectors', 'myTest.json'),
    );
    expect(selectorsExists).toBe(true);
  });
});
