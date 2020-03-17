import { ensureFile } from 'fs-extra';
import * as inquirer from 'inquirer';
import { tmpdir } from 'os';
import { join } from 'path';
import { promptOverwrite } from '../../src/cli/promptOverwrite';
import { randomString } from '../utils';

jest.mock('inquirer');

describe('promptOverwrite', () => {
  it('returns true if path does not exist', async () => {
    const path = join(tmpdir(), randomString(), 'myTest.test.js');

    const shouldSave = await promptOverwrite(path);
    expect(shouldSave).toBe(true);
  });

  it('returns true if path exists but can overwrite', async () => {
    jest.spyOn(inquirer, 'prompt').mockReturnValue({ overwrite: true } as any);

    const path = join(tmpdir(), randomString(), 'myTest.test.js');
    await ensureFile(path);

    const shouldSave = await promptOverwrite(path);
    expect(shouldSave).toBe(true);
  });

  it('returns false if path exists and cannot overwrite', async () => {
    jest.spyOn(inquirer, 'prompt').mockReturnValue({ overwrite: false } as any);

    const path = join(tmpdir(), randomString(), 'myTest.test.js');
    await ensureFile(path);

    const shouldSave = await promptOverwrite(path);
    expect(shouldSave).toBe(false);
  });
});
