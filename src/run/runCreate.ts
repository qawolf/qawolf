import { loadConfig } from '../config';
import { saveTemplate } from './saveTemplate';
import { runEdit } from './runEdit';

export type CreateOptions = {
  device?: string;
  isScript?: boolean;
  name: string;
  statePath?: string;
  url: string;
};

export const runCreate = async (options: CreateOptions): Promise<void> => {
  const config = loadConfig();

  const codePath = await saveTemplate({
    device: options.device,
    isScript: options.isScript,
    name: options.name,
    rootDir: config.rootDir,
    statePath: options.statePath,
    url: options.url,
    useTypeScript: config.useTypeScript,
  });
  if (!codePath) {
    // the user decided to not overwrite
    return;
  }

  runEdit({
    codePath,
    config,
    env: {
      QAW_CREATE: 'true',
    },
    isScript: options.isScript,
  });
};
