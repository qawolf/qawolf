import inquirer from 'inquirer';
import { once } from 'lodash';
import { relative } from 'path';
import { repl } from '../utils';
import { WatchHooks } from '../watch/WatchHooks';

export const shouldSavePrompt = async (codePath: string): Promise<boolean> => {
  const { choice } = await inquirer.prompt<{ choice: string }>([
    {
      choices: [
        '💾  Save and exit',
        '🖥️  Open REPL to run code',
        '🗑️  Discard and exit',
      ],
      message: `Edit your code at: ${relative(process.cwd(), codePath)}`,
      name: 'choice',
      type: 'list',
    },
  ]);

  if (choice.includes('REPL')) {
    await repl();
    return shouldSavePrompt(codePath);
  }

  const shouldSave = choice.includes('Save');
  return shouldSave;
};

export const createPrompt = (codePath: string): Promise<boolean | null> => {
  return new Promise(async (r) => {
    const resolve = once(r);
    shouldSavePrompt(codePath).then(resolve);
    WatchHooks.onStop(() => resolve(null));
  });
};
