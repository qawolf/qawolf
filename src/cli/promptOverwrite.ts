import { pathExists } from 'fs-extra';
import { prompt } from 'inquirer';

export const promptOverwrite = async (path: string): Promise<boolean> => {
  const exists = await pathExists(path);
  if (!exists) return true;

  const { overwrite } = await prompt<{ overwrite: boolean }>([
    {
      message: `"${path}" already exists, overwrite it?`,
      name: 'overwrite',
      type: 'confirm',
    },
  ]);

  return overwrite;
};
