import { pathExists } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { buildPath, saveTemplate } from '../../src/cli/saveTemplate';
import { randomString } from '../utils';

describe('buildPath', () => {
  it('builds script paths', () => {
    expect(
      buildPath({
        isScript: true,
        name: 'myScript',
        rootDir: '/scripts',
      }).replace(/\\/g, '/'), // windows
    ).toEqual('/scripts/myScript.js');

    expect(
      buildPath({
        isScript: true,
        name: 'myScript',
        rootDir: '/scripts',
        useTypeScript: true,
      }).replace(/\\/g, '/'),
    ).toEqual('/scripts/myScript.ts');
  });

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
  it('saves script template', async () => {
    const rootDir = join(tmpdir(), randomString());
    await saveTemplate({
      isScript: true,
      name: 'myScript',
      rootDir,
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
