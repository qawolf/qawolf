import Debug from 'debug';
import { join } from 'path';
import { cwd } from 'process';

type Config = {
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
    debug('error loading config from %s', error.message);
    userConfig = {};
  }

  const config: Config = {
    rootDir: userConfig.rootDir || '.qawolf/tests',
  };

  return config;
};
