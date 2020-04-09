import Debug from 'debug';
import { platform } from 'os';
// need to launch from playwright not playwright-core since the browsers are different
import playwright from 'playwright';

import { isNullOrUndefined } from 'util';
import { Registry } from './Registry';

const debug = Debug('qawolf:launch');

type BrowserName = 'chromium' | 'firefox' | 'webkit';

// need to manually specify
// https://github.com/microsoft/playwright/issues/1732
interface BrowserTypeLaunchOptions {
  headless?: boolean;
  executablePath?: string;
  args?: Array<string>;
  ignoreDefaultArgs?: boolean | Array<string>;
  handleSIGINT?: boolean;
  handleSIGTERM?: boolean;
  handleSIGHUP?: boolean;
  timeout?: number;
  dumpio?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  env?: Object;
  devtools?: boolean;
  slowMo?: number;
}

// We use any since there are no launch option types
// https://github.com/microsoft/playwright/issues/1732
export type LaunchOptions = BrowserTypeLaunchOptions & {
  browserName?: BrowserName;
};

const parseBool = (value: string | undefined): boolean => {
  const lowerCaseValue = (value || '').toLowerCase();
  return ['1', 't', 'true'].includes(lowerCaseValue);
};

export const parseBrowserName = (name?: string): BrowserName => {
  if (name === 'firefox' || name === 'webkit') return name;

  return 'chromium';
};

export const getLaunchOptions = (
  options: LaunchOptions = {},
): LaunchOptions & { browserName: BrowserName } => {
  const launchOptions = { ...options };

  const headlessEnv = process.env.QAW_HEADLESS;
  if (isNullOrUndefined(options.headless) && !isNullOrUndefined(headlessEnv)) {
    launchOptions.headless = parseBool(headlessEnv);
  }

  const browserName = parseBrowserName(
    options.browserName || process.env.QAW_BROWSER,
  );

  const defaultArgs: string[] = [];

  if (browserName === 'chromium' && platform() === 'linux') {
    // We use --no-sandbox because we cannot change the USER for certain CIs (like GitHub).
    // "Ensure your Dockerfile does not set the USER instruction, otherwise you will not be able to access GITHUB_WORKSPACE"
    defaultArgs.push('--no-sandbox');
  }

  return {
    args: defaultArgs,
    // override args if they are provided
    ...launchOptions,
    browserName,
  };
};

export const launch = async (
  options: LaunchOptions = {},
): Promise<playwright.Browser> => {
  const launchOptions = getLaunchOptions(options);
  debug('launch %j', launchOptions);

  const browser = await playwright[launchOptions.browserName].launch(
    launchOptions,
  );

  Registry.instance().setBrowser(browser);

  return browser;
};
