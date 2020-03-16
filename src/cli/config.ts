import Debug from 'debug';
import { join } from 'path';
import { cwd } from 'process';

type Config = {
  // argument passed to --config
  config?: string;
  isTypeScript: boolean;
  rootDir: string;
};

const debug = Debug('qawolf:config');

export const getConfigPath = () => join(cwd(), 'qawolf.config.js');

export const loadConfig = (path?: string): Config => {
  let userConfig: any;

  try {
    const configPath = path || getConfigPath();
    debug('load config from %s', configPath);

    userConfig = require(configPath);
  } catch (error) {
    debug(`error loading config from ${error.message}`);

    // use defaults
    return {
      config: '{}',
      isTypeScript: false,
      rootDir: '.qawolf',
    };
  }

  const config: Config = {
    config: userConfig.config,
    isTypeScript: userConfig.isTypeScript || false,
    rootDir: userConfig.rootDir || '.qawolf',
  };

  return config;
};
