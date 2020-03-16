import program from 'commander';
import { yellow } from 'kleur';
import { addCiCommands } from 'playwright-ci';
import updateNotifier from 'update-notifier';
import { loadConfig } from './config';
import { howl } from './howl';
import { omitArgs } from './omitArgs';
import { parseUrl } from './parseUrl';
import { runCommand } from './runCommand';
import { runJest } from './runJest';
import { saveTemplate } from './saveTemplate';
import { BrowserName } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package');

updateNotifier({ pkg }).notify();

program.usage('<command> [options]').version(pkg.version);

// XXX simplify
addCiCommands({ program, qawolf: true });

program
  .command('create [url] [name]')
  .option('-d, --device <device>', 'emulate using a playwright.device')
  .option('--name [name]', 'name', '')
  .option('-s, --script', 'create a script instead of a test')
  .option(
    '--statePath <statePath>',
    'path where state data (cookies, localStorage, sessionStorage) is saved',
  )
  .option('--url [url]', 'url', '')
  .description('create a test from browser actions')
  .action(async (urlArgument, nameArgument, cmd) => {
    const url = parseUrl(cmd.url || urlArgument || 'http://example.org');
    const name =
      cmd.name || nameArgument || (url.hostname || '').replace(/\..*/g, '');

    const config = await loadConfig();

    const codePath = await saveTemplate({
      device: cmd.device,
      name,
      isTypeScript: config.isTypeScript,
      rootDir: config.rootDir,
      script: cmd.script,
      statePath: cmd.statePath,
      url: url.href,
    });
    if (!codePath) {
      // the user decided to not overwrite
      return;
    }

    const env: NodeJS.ProcessEnv = {
      QAW_DISCARD: '1',
      QAW_HEADLESS: 'false',
    };

    try {
      if (cmd.script) {
        runCommand(`node ${codePath}`, {
          ...env,
          QAW_BROWSER: 'chromium',
        });
      } else {
        runJest({
          browsers: ['chromium'],
          config: config.config,
          env,
          rootDir: config.rootDir,
          repl: true,
          testPath: codePath,
        });
      }

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
  .description('run a test with Jest')
  .allowUnknownOption(true)
  .action(async (cmd = {}) => {
    const config = await loadConfig();

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

    if (!browsers.length) {
      browsers.push('chromium');
    }

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

      runJest({
        args: jestArgs,
        browsers,
        config: config.config,
        env: {
          QAW_HEADLESS: cmd.headless ? 'true' : 'false',
        },
        repl: !!cmd.repl,
        rootDir: config.rootDir,
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
