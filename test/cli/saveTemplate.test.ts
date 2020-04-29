import { writeFile } from 'fs-extra';
import { buildPath, saveTemplate } from '../../src/cli/saveTemplate';
import { buildTemplate } from '../../src/build-code/buildTemplate';

jest.mock('fs-extra');

const mockedWriteFile = writeFile as jest.Mock;

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
  const rootDir = __dirname;
  const options = { name: 'myTest', rootDir, url: 'www.qawolf.com' };

  beforeEach(() => mockedWriteFile.mockClear());

  it('saves provided templateFn', async () => {
    await saveTemplate({
      ...options,
      templateFn: async () => 'custom template',
    });
    expect(mockedWriteFile.mock.calls[0][1]).toEqual('custom template');
  });

  it('saves test template by default', async () => {
    await saveTemplate(options);
    expect(mockedWriteFile.mock.calls[0][1]).toEqual(buildTemplate(options));
  });
});
