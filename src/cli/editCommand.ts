import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { buildEditOptions } from '../run/buildEditOptions';
import { findTestPath } from '../run/findTestPath';
import { runTests } from '../run/runTests';

export const buildEditCommand = (): program.Command => {
  const command = new Command('edit')
    .storeOptionsAsProperties(false)
    .arguments('[name]')
    .option('--watch', 'watch mode')
    .description('📝 edit a test')
    .action(async () => {
      const opts = command.opts();
      const [name] = command.args;

      let args: string[];
      if (opts.watch) args = ['--watchAll'];

      const config = loadConfig();

      const testPath = await findTestPath({ rootDir: config.rootDir, name });

      runTests(
        buildEditOptions({
          args,
          config,
          testPath,
        }),
      );
    });

  return command;
};
