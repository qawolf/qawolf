import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { parseUrl } from './parseUrl';
import { buildEditOptions } from '../run/buildEditOptions';
import { runTests } from '../run/runTests';
import { saveTemplate } from './saveTemplate';

const DEFAULT_TEST_FILE_BASE_NAME = 'qawolf'

export type CreateOptions = {
  args?: string[];
  device?: string;
  name: string;
  statePath?: string;
  url: string;
};

export const runCreate = async (options: CreateOptions): Promise<void> => {
  const config = loadConfig();

  const testPath = await saveTemplate({
    device: options.device,
    name: options.name,
    rootDir: config.rootDir,
    statePath: options.statePath,
    templateFn: config.createTemplate,
    url: options.url,
    useTypeScript: config.useTypeScript,
  });
  if (!testPath) {
    // the user decided to not overwrite
    return;
  }

  runTests(
    buildEditOptions({
      args: options.args,
      config,
      env: {
        // discard should delete the test and selectors
        QAW_CREATE: 'true',
      },
      testPath,
    }),
  );
};

export const buildCreateCommand = (): program.Command => {
  const command = new Command('create')
    .storeOptionsAsProperties(false)
    .arguments('[url] [name]')
    .option('-d, --device <device>', 'emulate using a playwright.device')
    .option('--name <name>', 'name')
    .option(
      '--statePath <statePath>',
      'path where state data (cookies, localStorage, sessionStorage) is saved',
    )
    .option('--url <url>', 'url')
    .description('✨ create a test from browser actions')
    .action(async () => {
      const opts = command.opts();
      const [urlArgument, nameArgument] = command.args;

      let url = opts.url || urlArgument;
      let name = opts.name || nameArgument;

      if (url && url.length) {
        const parsedUrl = parseUrl(url);
        url = parsedUrl.href;

        if (!name) {
          name = (parsedUrl.hostname || '').replace(/\..*/g, '');
          if (name.length === 0) name = DEFAULT_TEST_FILE_BASE_NAME;
        }
      } else {
        name = DEFAULT_TEST_FILE_BASE_NAME;
      }

      await runCreate({
        device: opts.device,
        name,
        statePath: opts.statePath,
        url,
      });
    });

  return command;
};
