import { promises as fs } from 'fs';
import { detectTypeScript, writeConfig } from '../src/config';

test('detectTypeScript detects TypeScript', async () => {
  expect(await detectTypeScript()).toEqual(true);
});

test('writeConfig writes a config', async () => {
  const writeFileSpy = jest.spyOn(fs, 'writeFile');
  writeFileSpy.mockImplementationOnce(async () => {});

  await writeConfig({ rootDir: 'tests/acceptance', useTypeScript: true });
  expect(writeFileSpy.mock.calls[0][1]).toMatchInlineSnapshot(`
    "module.exports = {
      config: '{ \\\\\\"preset\\\\\\": \\\\\\"ts-jest\\\\\\" }',
      rootDir: 'tests/acceptance',
      testTimeout: 60000,
      useTypeScript: true
    }
    "
  `);

  writeFileSpy.mockRestore();
});
