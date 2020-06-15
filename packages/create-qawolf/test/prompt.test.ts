import * as fsExtra from 'fs-extra';
import * as prompt from '../src/cli';

const { promptOverwrite } = prompt;

jest.mock('fs-extra');

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('promptOverwrite', () => {
  afterAll(() => jest.restoreAllMocks());

  it('returns true if path does not exist', async () => {
    jest.spyOn(fsExtra, 'pathExists').mockReturnValue(false as any);

    const shouldSave = await promptOverwrite('myTest.test.js');
    expect(shouldSave).toBe(true);
  });

  it('returns true if path exists but can overwrite', async () => {
    jest.spyOn(fsExtra, 'pathExists').mockReturnValue(true as any);

    jest
      .spyOn(prompt, 'promptConfirmOverwrite')
      .mockReturnValue(new Promise((resolve) => resolve(true)));

    const shouldSave = await promptOverwrite('myTest.test.js');
    expect(shouldSave).toBe(true);
  });

  it('returns false if path exists and cannot overwrite', async () => {
    jest.spyOn(fsExtra, 'pathExists').mockReturnValue(true as any);
    jest
      .spyOn(prompt, 'promptConfirmOverwrite')
      .mockReturnValue(new Promise((resolve) => resolve(false)));

    const shouldSave = await promptOverwrite('myTest.test.js');
    expect(shouldSave).toBe(false);
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
