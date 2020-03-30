import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { runEdit } from '../run/runEdit';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .arguments('[file]')
    .storeOptionsAsProperties(false)
    .description('📝 edit a test')
    .action(async () => {
      const [fileArgument] = command.args;

      try {
        const config = loadConfig();

        runEdit({
          codePath: fileArgument,
          config,
          isScript: !fileArgument.includes('test'),
        });

        process.exit(0);
      } catch (e) {
        process.exit(1);
      }
    });

  return command;
};
