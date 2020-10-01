import program from 'commander';
import { yellow } from 'kleur';
import updateNotifier from 'update-notifier';
import { buildCreateCommand } from './createCommand';
import { buildEditCommand } from './editCommand';
import { buildHowlCommand } from './howlCommand';
import { buildTestCommand } from './testCommand';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package');
updateNotifier({ pkg }).notify();

program.usage('<command> [options]').version(pkg.version);

program.addCommand(buildCreateCommand());
program.addCommand(buildEditCommand());
program.addCommand(buildHowlCommand());
program.addCommand(buildTestCommand());

program.arguments('<command>').action((cmd) => {
  console.log(yellow(`Invalid command "${cmd}"\n`));
  program.help();
});

program.allowUnknownOption(false);

export const runCli = (): void => {
  program.parse(process.argv);
};
