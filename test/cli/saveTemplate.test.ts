import { ensureFile, pathExists } from 'fs-extra';
import * as inquirer from 'inquirer';
import { tmpdir } from 'os';
import { join } from 'path';
import { saveTemplate, shouldSaveTemplate } from '../../src/cli/saveTemplate';

// https://gist.github.com/6174/6062387
const randomString = (): string =>
  Math.random()
    .toString(36)
    .substring(2, 15);

jest.mock('inquirer');

describe('saveTemplate', () => {
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

      const fileExists = await pathExists(
        join(rootDir, 'scripts', 'myScript.js'),
      );
      expect(fileExists).toBe(true);

      const selectorsExists = await pathExists(
        join(rootDir, 'selectors', 'myScript.json'),
      );
      expect(selectorsExists).toBe(true);
    });

    it('saves test template', async () => {
      const rootDir = join(tmpdir(), randomString());
      await saveTemplate({ name: 'myTest', rootDir, url: 'www.qawolf.com' });

      const fileExists = await pathExists(
        join(rootDir, 'tests', 'myTest.test.js'),
      );
      expect(fileExists).toBe(true);

      const selectorsExists = await pathExists(
        join(rootDir, 'selectors', 'myTest.json'),
      );
      expect(selectorsExists).toBe(true);
    });

    it('saves at default location if rootDir not specified', async () => {
      const rootDir = join(tmpdir(), randomString());
      jest.spyOn(process, 'cwd').mockReturnValue(rootDir);
      await saveTemplate({ name: 'myTest', url: 'www.qawolf.com' });

      const fileExists = await pathExists(
        join(rootDir, '.qawolf', 'tests', 'myTest.test.js'),
      );
      expect(fileExists).toBe(true);
    });
  });

  describe('shouldSaveTemplate', () => {
    it('returns true if path does not exist', async () => {
      const path = join(tmpdir(), randomString(), 'myTest.test.js');

      const shouldSave = await shouldSaveTemplate(path);
      expect(shouldSave).toBe(true);
    });

    it('returns true if path exists but can overwrite', async () => {
      jest
        .spyOn(inquirer, 'prompt')
        .mockReturnValue({ overwrite: true } as any);

      const path = join(tmpdir(), randomString(), 'myTest.test.js');
      await ensureFile(path);

      const shouldSave = await shouldSaveTemplate(path);
      expect(shouldSave).toBe(true);
    });

    it('returns false if path exists and cannot overwrite', async () => {
      jest
        .spyOn(inquirer, 'prompt')
        .mockReturnValue({ overwrite: false } as any);

      const path = join(tmpdir(), randomString(), 'myTest.test.js');
      await ensureFile(path);

      const shouldSave = await shouldSaveTemplate(path);
      expect(shouldSave).toBe(false);
    });
  });
});
