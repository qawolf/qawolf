import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { getCodePath } from './getCodePath';
import { EditRunner } from '../run/EditRunner';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .arguments('[name]')
    .storeOptionsAsProperties(false)
    .description('📝 edit a test')
    .action(async () => {
      const [name] = command.args;

      const config = loadConfig();

      const codePath = await getCodePath({
        rootDir: config.rootDir,
        name,
        useTypeScript: config.useTypeScript,
      });

      await EditRunner.start({ codePath, config });
    });

  return command;
};
