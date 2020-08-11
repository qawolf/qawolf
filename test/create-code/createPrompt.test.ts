import inquirer from 'inquirer';
import { createPrompt } from '../../src/create-code/createPrompt';

describe('createPrompt', () => {
  it('discard resolve false', async () => {
    jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValue({ choice: 'Discard and exit' });
    const promise = createPrompt('');
    await expect(promise).resolves.toEqual(false);
  });

  it('save resolve true', async () => {
    jest
      .spyOn(inquirer, 'prompt')
      .mockResolvedValue({ choice: 'Save and exit' });
    const promise = createPrompt('');
    await expect(promise).resolves.toEqual(true);
  });
});
