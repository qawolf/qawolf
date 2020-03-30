import program, { Command } from 'commander';
import { parseUrl } from './parseUrl';
import { runCreate } from '../run/runCreate';

export const buildCreateCommand = (): program.Command => {
  const command = new Command('create')
    .storeOptionsAsProperties(false)
    .arguments('[url] [name]')
    .option('-d, --device <device>', 'emulate using a playwright.device')
    .option('--name <name>', 'name')
    .option('-s, --script', 'create a script instead of a test')
    .option(
      '--statePath <statePath>',
      'path where state data (cookies, localStorage, sessionStorage) is saved',
    )
    .option('--url <url>', 'url')
    .description('✨ create a test from browser actions')
    .action(async () => {
      const opts = command.opts();
      const [urlArgument, nameArgument] = command.args;

      const urlString = opts.url || urlArgument || 'http://example.org';
      const url = parseUrl(urlString);

      let name = opts.name || nameArgument;
      if (!name) {
        name = (url.hostname || '').replace(/\..*/g, '');
      }

      await runCreate({
        device: opts.device,
        name,
        isScript: opts.script,
        statePath: opts.statePath,
        url: url.href,
      });
    });

  return command;
};
