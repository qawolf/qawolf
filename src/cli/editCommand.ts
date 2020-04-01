import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { getCodePath } from './getCodePath';
import { RunServer } from '../run/RunServer';

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

      await RunServer.start({
        codePath,
        config,
        env: {
          QAW_HEADLESS: 'false',
        },
        watch: true,
      });
    });

  return command;
};
