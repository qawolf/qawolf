import program, { Command } from 'commander';
import { loadConfig } from '../config';
import { parseUrl } from './parseUrl';
import { runCommand } from './runCommand';
import { runJest } from './runJest';
import { saveTemplate } from './saveTemplate';

export type CreateOptions = {
  device?: string;
  isScript?: boolean;
  name: string;
  statePath?: string;
  url: string;
};

export const runCreate = async (options: CreateOptions): Promise<void> => {
  const config = loadConfig();

  const codePath = await saveTemplate({
    device: options.device,
    isScript: options.isScript,
    name: options.name,
    rootDir: config.rootDir,
    statePath: options.statePath,
    templateFn: config.createTemplate,
    url: options.url,
    useTypeScript: config.useTypeScript,
  });
  if (!codePath) {
    // the user decided to not overwrite
    return;
  }

  const env: NodeJS.ProcessEnv = {
    QAW_CREATE: 'true',
    QAW_HEADLESS: 'false',
  };

  if (options.isScript) {
    runCommand(`${config.useTypeScript ? 'ts-node' : 'node'} ${codePath}`, {
      ...env,
      QAW_BROWSER: 'chromium',
    });
    return;
  }

  runJest({
    browsers: ['chromium'],
    config: config.config,
    env,
    repl: true,
    rootDir: config.rootDir,
    testPath: codePath,
    testTimeout: config.testTimeout,
  });
};

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
