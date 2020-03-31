import { execSync } from 'child_process';
import { buildJestArguments, JestOptions } from './buildJestArguments';
import { BrowserName } from '../types';

type TestOptions = JestOptions & {
  browsers: BrowserName[];
  env?: NodeJS.ProcessEnv;
  headless?: boolean;
};

export const runTests = (options: TestOptions): void => {
  const command = `npx jest ${buildJestArguments(options).join(' ')}`;

  for (const browser of options.browsers) {
    console.log(`Test: ${browser}`);
    // log the command to show the user how to run it directly
    console.log(`${command}\n`);

    execSync(command, {
      stdio: 'inherit',
      env: {
        QAW_BROWSER: browser,
        ...options.env,
        // override env with process.env
        // ex. for unit tests we want QAW_BROWSER to override cli one
        ...process.env,
      },
    });
  }
};
