import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { findTestPath } from '../run/findTestPath';
import { runTests } from '../run/runTests';
import { buildEditOptions } from '../run/buildEditOptions';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .arguments('[name]')
    .storeOptionsAsProperties(false)
    .description('📝 edit a test')
    .action(async () => {
      const [name] = command.args;

      const config = loadConfig();

      const testPath = await findTestPath({ rootDir: config.rootDir, name });

      runTests(
        buildEditOptions({
          config,
          testPath,
        }),
      );
    });

  return command;
};
