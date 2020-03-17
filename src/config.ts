import Debug from 'debug';
import { join } from 'path';
import { cwd } from 'process';
import { TemplateFunction } from './build-code/buildTemplate';

type Config = {
  attribute: string;
  createScriptTemplate?: TemplateFunction;
  createTestTemplate?: TemplateFunction;
  // argument passed to --config
  config?: string;
  rootDir: string;
  useTypeScript: boolean;
};

const debug = Debug('qawolf:config');

export const DEFAULT_ATTRIBUTE =
  'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/';

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
      attribute: process.env.QAW_ATTRIBUTE || DEFAULT_ATTRIBUTE,
      config: '{}',
      useTypeScript: false,
      rootDir: '.qawolf',
    };
  }

  const config: Config = {
    // prefer environment variable over config
    attribute:
      process.env.QAW_ATTRIBUTE || userConfig.attribute || DEFAULT_ATTRIBUTE,
    createScriptTemplate: userConfig.createScriptTemplate,
    createTestTemplate: userConfig.createTestTemplate,
    config: userConfig.config,
    useTypeScript: userConfig.useTypeScript || false,
    rootDir: userConfig.rootDir || '.qawolf',
  };

  return config;
};
