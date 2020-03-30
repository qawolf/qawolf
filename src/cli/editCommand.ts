import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { getCodePath } from './getCodePath';
import { runEdit } from '../run/runEdit';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .arguments('[name]')
    .storeOptionsAsProperties(false)
    .description('📝 edit a test')
    .action(async () => {
      try {
        const [name] = command.args;

        const config = loadConfig();

        const codePath = await getCodePath({
          rootDir: config.rootDir,
          name,
          useTypeScript: config.useTypeScript,
        });

        runEdit({
          codePath,
          config,
          isScript: !codePath.includes('test'),
        });

        process.exit(0);
      } catch (e) {
        process.exit(1);
      }
    });

  return command;
};
