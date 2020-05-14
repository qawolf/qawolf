import inquirer from 'inquirer';
import { relative } from 'path';
import { repl } from '../utils';

export const createPrompt = async (codePath: string): Promise<boolean> => {
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
    return createPrompt(codePath);
  }

  const shouldSave = choice.includes('Save');
  return shouldSave;
};
