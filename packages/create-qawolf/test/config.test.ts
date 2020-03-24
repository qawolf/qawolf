import { writeFile } from 'fs-extra';
import { detectTypeScript, writeConfig } from '../src/config';

jest.mock('fs-extra');

const mockedWriteFile = writeFile as jest.Mock;

test('detectTypeScript detects TypeScript', async () => {
  expect(await detectTypeScript()).toEqual(true);
});

test('writeConfig writes a config', async () => {
  await writeConfig({ rootDir: 'tests/acceptance', useTypeScript: true });
  expect(mockedWriteFile.mock.calls[0][1]).toMatchInlineSnapshot(`
    "module.exports = {
      config: \\"node_modules/qawolf/ts-jest.config.json\\",
      rootDir: \\"tests/acceptance\\",
      testTimeout: 60000,
      useTypeScript: true
    }
    "
  `);
});
