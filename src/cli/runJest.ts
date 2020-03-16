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
  testPath?: string;
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
    // clear Jest config unless one is provided
    // must be wrapped in quotes for powershell
    builtArgs.push('--config="{}"');
  }

  if (options.repl) {
    // need to use our basic reporter that does not interfere with the repl
    builtArgs.push('--reporters="@qawolf/jest-reporter"');
  }

  const rootDir = options.rootDir || '.qawolf';
  builtArgs.push(`--rootDir=${rootDir}`);

  const hasTimeoutArg = !!providedArgs.find(arg =>
    arg.toLowerCase().includes('testtimeout'),
  );
  if (!hasTimeoutArg) {
    // for repl: timeout after 1 hour
    // otherwise: timeout after 60 seconds (playwright default wait timeout is 30 seconds)
    builtArgs.push(`--testTimeout=${options.repl ? '3600000' : '60000'}`);
  }

  if (options.testPath) {
    // must be forward slashes to work in powershell
    const testPath = options.testPath.replace(/\\/g, '/');
    builtArgs.push(`"${testPath}"`);
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
