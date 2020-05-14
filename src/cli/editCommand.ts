import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { buildEditOptions } from '../run/buildEditOptions';
import { findTestPath } from '../run/findTestPath';
import { runTests } from '../run/runTests';
import { omitArgs } from './omitArgs';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .arguments('[name]')
    .storeOptionsAsProperties(false)
    .description('📝 edit a test')
    .allowUnknownOption(true)
    .action(async () => {
      const [name] = command.args;

      // omit qawolf arguments
      const jestArgs = omitArgs(process.argv.slice(3), [
        '--headless',
        '--rootDir', // should be passed through config
      ]);

      const config = loadConfig();

      const testPath = await findTestPath({ rootDir: config.rootDir, name });

      runTests(
        buildEditOptions({
          args: jestArgs,
          config,
          testPath,
        }),
      );
    });

  return command;
};
