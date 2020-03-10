import program from 'commander';
import { yellow } from 'kleur';
import { addCiCommands } from 'playwright-ci';
import updateNotifier from 'update-notifier';
import { howl } from './howl';
import { runCommand, runJest } from './run';
import { saveTemplate } from './saveTemplate';
import { BrowserName } from '../types';
import { omitArgs, parseUrl } from './utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package');

updateNotifier({ pkg }).notify();

program.usage('<command> [options]').version(pkg.version);

addCiCommands({ program, qawolf: true });

program
  .command('create [url] [name]')
  .option('-d, --device <device>', 'emulate using a playwright.device')
  .option('--name [name]', 'name', '')
  .option(
    '-r, --rootDir <rootDir>',
    'directory where test or script will be saved',
  )
  .option('-s, --script', 'create a script instead of a test')
  .option(
    '--statePath <statePath>',
    'path where state data (cookies, localStorage, sessionStorage) is saved',
  )
  .option('--url [url]', 'url', 'http://example.org')
  .description('create a test from browser actions')

  .action(async (urlArgument, nameArgument, cmd) => {
    const url = parseUrl(cmd.url || urlArgument);
    const name =
      cmd.name || nameArgument || (url.hostname || '').replace(/\..*/g, '');

    const codePath = await saveTemplate({
      device: cmd.device,
      name,
      script: cmd.script,
      statePath: cmd.statePath,
      url: url.href,
    });
    if (!codePath) {
      // the user decided to not overwrite
      return;
    }

    const env: NodeJS.ProcessEnv = {
      QAW_BROWSER: 'chromium',
      // let qawolf.create know to remove the file on discard
      QAW_DISCARD: '1',
      QAW_HEADLESS: 'false',
    };

    try {
      if (cmd.script) {
        runCommand(`node ${codePath}`, env);
      } else {
        runJest([codePath], {
          env,
          rootDir: cmd.rootDir,
          repl: true,
        });
      }

      process.exit(0);
    } catch (e) {
      process.exit(1);
    }
  });

program
  .command('test')
  .option(
    '--rootDir <rootDir>',
    'root directory of test code, defaults to workingDirectory/.qawolf',
  )
  .option('--all-browsers', 'run tests on chromium, firefox, and webkit')
  .option('--chromium', 'run tests on chromium')
  .option('--firefox', 'run tests on firefox')
  .option('--headless', 'run tests headless')
  .option('--repl', 'open a REPL when repl() is called')
  .option('--webkit', 'run tests on webkit')
  .description('run a test with Jest')
  .allowUnknownOption(true)
  .action((cmd = {}) => {
    const args = omitArgs(process.argv.slice(3), [
      '--all-browsers',
      '--chromium',
      '--firefox',
      '--headless',
      '--repl',
      '--webkit',
    ]);

    const browsers: BrowserName[] = [];

    if (cmd.allBrowsers || cmd.chromium) {
      browsers.push('chromium');
    }

    if (cmd.allBrowsers || cmd.firefox) {
      browsers.push('firefox');
    }

    if (cmd.allBrowsers || cmd.webkit) {
      browsers.push('webkit');
    }

    try {
      runJest(args, {
        browsers,
        headless: !!cmd.headless,
        repl: !!cmd.repl,
        rootDir: cmd.rootDir,
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
