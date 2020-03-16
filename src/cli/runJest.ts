import { runCommand } from './runCommand';
import { BrowserName } from '../types';

type TestOptions = {
  args?: string[];
  browsers: BrowserName[];
  config?: string;
  env?: NodeJS.ProcessEnv;
  headless?: boolean;
  repl?: boolean;
  rootDir?: string;
};

export const buildArguments = (
  options: Omit<TestOptions, 'browsers'>,
): string[] => {
  const builtArgs: string[] = [];

  const providedArgs = options.args || [];

  const hasConfigArg = !!providedArgs.find(arg =>
    arg.toLowerCase().includes('config'),
  );
  if (!hasConfigArg) {
    // prevent using the local jest config
    // unless config is passed
    builtArgs.push('--config={}');
  }

  if (options.repl) {
    // need to use our basic reporter that does not interfere with the repl
    builtArgs.push('--reporters="@qawolf/jest-reporter"');
  }

  builtArgs.push(`--rootDir=${options.rootDir || '.qawolf'}`);

  const hasTimeoutArg = !!providedArgs.find(arg =>
    arg.toLowerCase().includes('testtimeout'),
  );
  if (!hasTimeoutArg) {
    // for repl: timeout after 1 hour
    // otherwise: timeout after 60 seconds (playwright default wait timeout is 30 seconds)
    builtArgs.push(`--testTimeout=${options.repl ? '3600000' : '60000'}`);
  }

  if (providedArgs.length) {
    builtArgs.push(...providedArgs);
  }

  return builtArgs;
};

export const runJest = (options: TestOptions) => {
  const command = `npx jest ${buildArguments(options).join(' ')}`;

  for (const browser of options.browsers) {
    console.log(`Test: ${browser}`);
    runCommand(command, {
      QAW_BROWSER: browser,
      ...(options.env || {}),
    });
  }
};
