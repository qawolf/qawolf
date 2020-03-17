import { pathExists } from 'fs-extra';
import { tmpdir } from 'os';
import { join } from 'path';
import { buildPath, saveTemplate } from '../../src/cli/saveTemplate';
import { randomString } from '../utils';

describe('buildPath', () => {
  it('builds script paths', () => {
    expect(
      buildPath({ name: 'myScript', rootDir: '/scripts', script: true }),
    ).toEqual('/scripts/myScript.js');

    expect(
      buildPath({
        name: 'myScript',
        rootDir: '/scripts',
        script: true,
        useTypeScript: true,
      }),
    ).toEqual('/scripts/myScript.ts');
  });

  it('builds test paths', () => {
    expect(buildPath({ name: 'myScript', rootDir: '/tests' })).toEqual(
      '/tests/myScript.test.js',
    );

    expect(
      buildPath({
        name: 'myScript',
        rootDir: '/tests',
        useTypeScript: true,
      }),
    ).toEqual('/tests/myScript.test.ts');
  });
});

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
