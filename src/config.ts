import Debug from 'debug';
import { isNil } from 'lodash';
import { join } from 'path';
import { cwd } from 'process';
import { TemplateFunction } from './build-code/buildTemplate';

export type Config = {
  attribute?: string;
  createTemplate?: TemplateFunction;
  // argument passed to --config
  config?: string;
  rootDir: string;
  testTimeout: number;
  useTypeScript: boolean;
  watch: boolean;
};

const debug = Debug('qawolf:config');

export const getConfigPath = (): string => join(cwd(), 'qawolf.config.js');

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
      config: 'node_modules/qawolf/js-jest.config.json',
      rootDir: '.qawolf',
      testTimeout: 60000,
      useTypeScript: false,
      watch: true,
    };
  }

  const config: Config = {
    attribute: userConfig.attribute,
    createTemplate: userConfig.createTemplate,
    // do not override config when this is found in user config
    config: userConfig.config,
    rootDir: userConfig.rootDir || '.qawolf',
    testTimeout: userConfig.testTimeout || 60000,
    useTypeScript: userConfig.useTypeScript || false,
    watch: isNil(userConfig.watch) ? true : userConfig.watch,
  };

  return config;
};
