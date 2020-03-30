import { Config } from '../config';
import { runCommand } from './runCommand';
import { runJest } from './runJest';

type EditOptions = {
  codePath: string;
  config: Config;
  env?: NodeJS.ProcessEnv;
  isScript?: boolean;
};

export const runEdit = ({ config, ...options }: EditOptions): void => {
  const env: NodeJS.ProcessEnv = {
    ...options.env,
    QAW_EDIT: 'true',
    QAW_HEADLESS: 'false',
  };

  if (options.isScript) {
    runCommand(
      `${config.useTypeScript ? 'ts-node -D 6133' : 'node'} ${
        options.codePath
      }`,
      {
        ...env,
        QAW_BROWSER: 'chromium',
      },
    );
    return;
  }

  runJest({
    browsers: ['chromium'],
    config: config.config,
    env,
    repl: true,
    rootDir: config.rootDir,
    testPath: options.codePath,
    testTimeout: config.testTimeout,
  });
};
