import { ChildProcess, spawn } from 'child_process';
import { buildJestArguments } from './buildJestArguments';
import { Config } from '../config';

export type EditOptions = {
  codePath: string;
  config: Config;
  env?: NodeJS.ProcessEnv;
};

export const buildEditArguments = ({
  codePath,
  config,
}: EditOptions): string[] => {
  const args: string[] = [];

  if (codePath.includes('spec') || codePath.includes('test')) {
    args.push(...['npx', 'jest']);

    args.push(
      ...buildJestArguments({
        config: config.config,
        repl: true,
        rootDir: config.rootDir,
        testTimeout: config.testTimeout,
      }),
    );

    // manually include code as the last argument
    // if we provided it to buildJestArguments({ testPath }) it would be escaped with quotes
    args.push(codePath);
  } else {
    if (config.useTypeScript) {
      args.push(...['ts-node', '-D=6133']);
    } else {
      args.push('node');
    }

    args.push(codePath);
  }

  return args;
};

export const spawnEdit = (options: EditOptions): ChildProcess => {
  const env: NodeJS.ProcessEnv = {
    ...options.env,
    QAW_EDIT: 'true',
    QAW_HEADLESS: 'false',
  };

  const args = buildEditArguments(options);

  const child = spawn(args[0], args.slice(1), {
    env: {
      ...env,
      // override env with process.env
      // ex. for unit tests we want QAW_BROWSER to override cli one
      ...process.env,
    },
    stdio: 'inherit',
  });

  return child;
};
