import { BrowserName } from '../types';
import { execSync } from 'child_process';

type RunJestOptions = {
  browsers?: BrowserName[];
  config?: string;
  path?: string;
  repl?: boolean;
};

const runCommand = (command: string, env: NodeJS.ProcessEnv = {}) => {
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

export const runJest = (args: string[] = [], options: RunJestOptions = {}) => {
  /**
   * Returns exit code. 0 for success, 1 for failed.
   */
  let command = `npx jest`;

  if (!args.some(arg => arg.startsWith('--config'))) {
    // prevent using the local jest config
    // unless config is passed
    command += ' --config={}';
  }

  if (options.repl) {
    command += ` --reporters="@qawolf/jest-reporter"`;
  }

  const rootDir = options.path || '.qawolf';
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

  try {
    if (options.browsers && options.browsers.length) {
      for (let browser of options.browsers) {
        console.log(`Test: ${browser}`);
        runCommand(command, { QAW_BROWSER: browser });
      }
    } else {
      runCommand(command);
    }

    return 0;
  } catch (e) {
    return 1;
  }
};
