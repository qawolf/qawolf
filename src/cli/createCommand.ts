import { loadConfig } from '../config';
import { runCommand } from './runCommand';
import { runJest } from './runJest';
import { saveTemplate } from './saveTemplate';

type CreateCommandOptions = {
  device?: string;
  filename: string;
  isScript?: boolean;
  statePath?: string;
  url: string;
};

export const createCommand = async (
  options: CreateCommandOptions,
): Promise<void> => {
  const config = loadConfig();

  const codePath = await saveTemplate({
    device: options.device,
    isScript: options.isScript,
    name: options.filename,
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
