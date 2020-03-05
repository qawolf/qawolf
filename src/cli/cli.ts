// import { BrowserType } from '@qawolf/types';
import program from 'commander';
import { yellow } from 'kleur';
// TODO add cli commands to commander from playwright-ci
import { addCiCommands } from 'playwright-ci';
import { howl } from './howl';
// import { runJest } from './runJest';
// import { omitArgs } from './utils';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package');

program.usage('<command> [options]').version(pkg.version);

addCiCommands({ program, qawolf: true });

// TODO
// program
//   .command('create <url> [name]')
// .option("-d, --device <device>", "emulate using a playwright.device")
// .option("-r, --rootDir <rootDir>", "directory where test or script will be saved")
// .option("-s, --script", "create a script instead of a test")
//   .description('create a test from browser actions')
//   .action(async (urlArgument, optionalName, cmd) => {
//     const url = parseUrl(urlArgument);
//     const name = optionalName || url.hostname!.replace(/\..*/g, '');
//   });

// program
//   .command('test')
//   .option('-r, --rootDir <rootDir>', 'directory where script will be saved')
//   .option('--all-browsers', 'run tests on chromium, firefox, and webkit')
//   .option('--chromium', 'run tests on chromium')
//   .option('--firefox', 'run tests on firefox')
//   .option('--repl', 'open a REPL when repl() is called')
//   .option('--webkit', 'run tests on webkit')
//   .description('run a test with Jest')
//   .allowUnknownOption(true)
//   .action((cmd = {}) => {
//     const args = omitArgs(process.argv.slice(3), [
//       '--all-browsers',
//       '--chromium',
//       '--firefox',
//       '-p',
//       '--path',
//       '--repl',
//       '--webkit',
//     ]);

//     let browsers: BrowserType[] = [];

//     if (cmd.allBrowsers || cmd.chromium) {
//       browsers.push('chromium');
//     }

//     if (cmd.allBrowsers || cmd.firefox) {
//       browsers.push('firefox');
//     }

//     if (cmd.allBrowsers || cmd.webkit) {
//       browsers.push('webkit');
//     }

//     const code = runJest(args, {
//       browsers,
//       path: cmd.path,
//       repl: !!cmd.repl,
//     });
//     process.exit(code);
//   });

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
