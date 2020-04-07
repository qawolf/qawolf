import { pathExists } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { buildPath, saveTemplate } from '../../src/cli/saveTemplate';
import { randomString } from '../utils';

describe('buildPath', () => {
  it('builds test paths', () => {
    expect(
      buildPath({ name: 'myScript', rootDir: '/tests' }).replace(/\\/g, '/'),
    ).toEqual('/tests/myScript.test.js');

    expect(
      buildPath({
        name: 'myScript',
        rootDir: '/tests',
        useTypeScript: true,
      }).replace(/\\/g, '/'),
    ).toEqual('/tests/myScript.test.ts');
  });
});

describe('saveTemplate', () => {
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
