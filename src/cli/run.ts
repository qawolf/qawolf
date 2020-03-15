import { BrowserName } from '../types';
import { execSync } from 'child_process';

type RunJestOptions = {
  browsers?: BrowserName[];
  config?: string;
  env?: NodeJS.ProcessEnv;
  headless?: boolean;
  repl?: boolean;
  rootDir?: string;
};

export const runCommand = (
  command: string,
  env: NodeJS.ProcessEnv = {},
): void => {
  // log the command we run to make it clear this is an alias for npx jest
  console.log(command + '\n');

  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...env,
    },
  });
};

export const runJest = (
  args: string[] = [],
  options: RunJestOptions = {},
): void => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */
  let command = '';

  command += `npx jest`;

  if (!args.some(arg => arg.startsWith('--config'))) {
    // prevent using the local jest config
    // unless config is passed
    command += ' --config={}';
  }

  if (options.repl) {
    command += ` --reporters="@qawolf/jest-reporter"`;
  }

  const rootDir = options.rootDir || '.qawolf';
  command += ` --rootDir=${rootDir}`;

  const hasTimeout =
    args.findIndex(a => a.toLowerCase().includes('testtimeout')) > -1;

  if (!hasTimeout) {
    // timeout after 1 hour for repl
    // timeout after 1 minute otherwise
    const timeout = options.repl ? '3600000' : '60000';
    command += ` --testTimeout=${timeout}`;
  }

  // pass through other arguments to jest
  if (args.length) {
    command += ` ${args.join(' ')}`;
  }

  const env: NodeJS.ProcessEnv = options.env || {};

  if (!options.headless) {
    env.QAW_HEADLESS = 'false';
  }

  if (options.browsers && options.browsers.length) {
    for (const browser of options.browsers) {
      console.log(`Test: ${browser}`);
      runCommand(command, { ...env, QAW_BROWSER: browser });
    }
  } else {
    runCommand(command, env);
  }
};
