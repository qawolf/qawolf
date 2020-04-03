import { basename } from 'path';
import { buildJestArguments } from './buildJestArguments';
import { Config } from '../config';

export type RunOptions = {
  codePath: string;
  config: Config;
  env?: NodeJS.ProcessEnv;
};

export const buildRunArguments = ({
  codePath,
  config,
}: RunOptions): string[] => {
  const args: string[] = [];

  const name = basename(codePath);
  if (name.includes('spec') || name.includes('test')) {
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
      // 6133: allow unused (selectors is not used until first command)
      args.push(...['ts-node', '-D', '6133']);
    } else {
      args.push('node');
    }

    args.push(codePath);
  }

  return args;
};
