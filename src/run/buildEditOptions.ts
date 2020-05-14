import { JestOptions } from './buildJestArguments';
import { TestOptions } from './runTests';

export type EditOptions = JestOptions & {
  env?: NodeJS.ProcessEnv;
  testPath: string;
};

export const buildEditOptions = (options: EditOptions): TestOptions => {
  let args = [];

  // prevent Jest from force exiting a test
  // so we can close the browser
  args.push('--detectOpenHandles');

  // need to use our basic reporter that does not interfere with the repl
  args.push('--reporters="@qawolf/jest-reporter"');

  // timeout after an hour
  args.push('--testTimeout=3600000');

  if (options.args) {
    args = [...args, ...options.args];
  }

  return {
    ...options,
    args,
    browsers: ['chromium'],
    env: {
      ...options.env,
      // simplify the UI
      CI: 'true',
    },
    headless: false,
  };
};
