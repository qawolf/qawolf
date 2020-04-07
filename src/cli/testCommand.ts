import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { omitArgs } from './omitArgs';
import { runTests } from '../run/runTests';
import { BrowserName } from '../types';

export const buildTestCommand = (): program.Command => {
  const command = new Command('test')
    .storeOptionsAsProperties(false)
    .option('--all-browsers', 'run tests on chromium, firefox, and webkit')
    .option('--chromium', 'run tests on chromium')
    .option('--firefox', 'run tests on firefox')
    .option('--headless', 'run tests headless')
    .option('--webkit', 'run tests on webkit')
    .description('✅ run tests')
    .allowUnknownOption(true)
    .action(async () => {
      const opts = command.opts();

      const browsers: BrowserName[] = [];
      if (opts.allBrowsers || opts.chromium) browsers.push('chromium');
      if (opts.allBrowsers || opts.firefox) browsers.push('firefox');
      if (opts.allBrowsers || opts.webkit) browsers.push('webkit');
      if (!browsers.length) browsers.push('chromium');

      // omit qawolf arguments
      const jestArgs = omitArgs(process.argv.slice(3), [
        '--all-browsers',
        '--chromium',
        '--firefox',
        '--headless',
        '--rootDir', // should be passed through config
        '--webkit',
      ]);

      const config = loadConfig();

      try {
        runTests({
          args: jestArgs,
          browsers,
          config: config,
          headless: opts.headless,
        });
      } catch (e) {
        process.exit(1);
      }
    });

  return command;
};
