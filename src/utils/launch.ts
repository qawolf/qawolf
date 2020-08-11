import Debug from 'debug';
import { platform } from 'os';
import playwrightCore, {
  Browser,
  BrowserType,
  LaunchOptions as PlaywrightLaunchOptions,
} from 'playwright';
import { isNullOrUndefined } from 'util';
import { Registry } from './Registry';

const debug = Debug('qawolf:launch');

type BrowserName = 'chromium' | 'firefox' | 'webkit';

export type LaunchOptions = PlaywrightLaunchOptions & {
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

export const getBrowserType = (
  browserName: BrowserName,
): BrowserType<Browser> => {
  // We must use the browser type from the installed `playwright` or `playwright-browser` package,
  // and not `playwright-core` since they store different browser binaries.
  // See https://github.com/microsoft/playwright/issues/1191 for more details.
  let playwright: typeof playwrightCore;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    playwright = require('playwright');
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      playwright = require(`playwright-${browserName}`);
    } catch (error) {
      throw new Error('qawolf requires playwright to be installed');
    }
  }

  return playwright[browserName];
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

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  const launchOptions = getLaunchOptions(options);
  debug('launch %j', launchOptions);

  const browser = await getBrowserType(launchOptions.browserName).launch(
    launchOptions,
  );

  Registry.instance().setBrowser(browser);

  return browser;
};
