import inquirer from 'inquirer';
import { relative } from 'path';
import { repl } from '../utils';
import { WatchHooks } from '../watch/WatchHooks';

export const KEYS = {
  down: '\u001b[B',
  enter: '\n',
};

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
  return new Promise((resolve) => {
    let resolved: boolean = false;

    const done = (shouldSave: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(shouldSave);
    };

    shouldSavePrompt(codePath).then(done);

    WatchHooks.onStop(() => {
      // prevent the enter from resolving a value
      resolved = true;

      // press enter before resolving to make sure the prompt closes
      process.stdin.push(KEYS.enter);

      resolve(null);
    });
  });
};
