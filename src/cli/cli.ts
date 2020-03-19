import program from 'commander';
import { yellow } from 'kleur';
import { install as installCi } from 'playwright-ci';
import updateNotifier from 'update-notifier';
import { loadConfig } from '../config';
import { createCommand } from './createCommand';
import { howl } from './howl';
import { omitArgs } from './omitArgs';
import { parseUrl } from './parseUrl';
import { runJest } from './runJest';
import { BrowserName } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package');

updateNotifier({ pkg }).notify();

program.usage('<command> [options]').version(pkg.version);

program
  .command('ci')
  .description('☁️ set up CI')
  .action(async () => await installCi());

program
  .command('create [url] [filename]')
  .option('-d, --device <device>', 'emulate using a playwright.device')
  .option('--filename <filename>', 'filename')
  .option('-s, --script', 'create a script instead of a test')
  .option(
    '--statePath <statePath>',
    'path where state data (cookies, localStorage, sessionStorage) is saved',
  )
  .option('--url <url>', 'url')
  .description('✨ create a test from browser actions')
  .action(async (urlArgument, filenameArgument, cmd) => {
    const urlString = cmd.url || urlArgument || 'http://example.org';
    const url = parseUrl(urlString);

    let filename = cmd.filename || filenameArgument;
    if (!filename) {
      filename = (url.hostname || '').replace(/\..*/g, '');
    }

    try {
      await createCommand({
        device: cmd.device,
        filename,
        isScript: cmd.script,
        statePath: cmd.statePath,
        url: url.href,
      });

      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  });

program
  .command('test')
  .option('--all-browsers', 'run tests on chromium, firefox, and webkit')
  .option('--chromium', 'run tests on chromium')
  .option('--firefox', 'run tests on firefox')
  .option('--headless', 'run tests headless')
  .option('--repl', 'open a REPL when repl() is called')
  .option('--webkit', 'run tests on webkit')
  .description('✅ run browser tests with Jest')
  .allowUnknownOption(true)
  .action(async (cmd = {}) => {
    const browsers: BrowserName[] = [];
    if (cmd.allBrowsers || cmd.chromium) browsers.push('chromium');
    if (cmd.allBrowsers || cmd.firefox) browsers.push('firefox');
    if (cmd.allBrowsers || cmd.webkit) browsers.push('webkit');
    if (!browsers.length) browsers.push('chromium');

    try {
      // omit qawolf arguments
      const jestArgs = omitArgs(process.argv.slice(3), [
        '--all-browsers',
        '--chromium',
        '--firefox',
        '--headless',
        '--repl',
        // should be passed through config
        '--rootDir',
        '--webkit',
      ]);

      const config = loadConfig();

      runJest({
        args: jestArgs,
        browsers,
        config: config.config,
        env: {
          QAW_HEADLESS: cmd.headless ? 'true' : 'false',
        },
        repl: !!cmd.repl,
        rootDir: config.rootDir,
        testTimeout: config.testTimeout,
      });

      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  });

program
  .command('howl')
  .description('🐺')
  .action(howl);

program.arguments('<command>').action(cmd => {
  console.log(yellow(`Invalid command "${cmd}"\n`));
  program.help();
});

program.allowUnknownOption(false);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  console.log('\n');
  program.outputHelp();
}
