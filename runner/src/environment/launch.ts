import { pick } from "lodash";
import playwright, {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  LaunchOptions as PlaywrightLaunchOptions,
} from "playwright";

import { addInitScript } from "./addInitScript";

const BROWSER_CONTEXT_OPTIONS = [
  "acceptDownloads",
  "bypassCSP",
  "colorScheme",
  "deviceScaleFactor",
  "extraHTTPHeaders",
  "geolocation",
  "hasTouch",
  "httpCredentials",
  "ignoreHTTPSErrors",
  "isMobile",
  "locale",
  "offline",
  "permissions",
  "proxy",
  "storageState",
  "timezoneId",
  "userAgent",
  "viewport",
] as const;

const LAUNCH_OPTIONS = [
  "args",
  "devtools",
  "env",
  "firefoxUserPrefs",
  "proxy",
  "slowMo",
  "timeout",
] as const;

const BROWSER_NAMES = ["chromium", "firefox", "webkit"] as const;

export type BrowserName = typeof BROWSER_NAMES[number];

export type LaunchOptions = Pick<
  BrowserContextOptions,
  typeof BROWSER_CONTEXT_OPTIONS[number]
> &
  Pick<PlaywrightLaunchOptions, typeof LAUNCH_OPTIONS[number]> & {
    browser?: BrowserName;
    headless?: boolean;
  };

export type LaunchResult = {
  browser: Browser;
  context: BrowserContext;
};

const chromiumArgs = [
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--window-position=0,0",
];

export const getBrowserName = (name?: BrowserName): BrowserName => {
  if (name && BROWSER_NAMES.includes(name)) return name;

  return "chromium";
};

export const launch = async (
  options: LaunchOptions = {}
): Promise<LaunchResult> => {
  const browserName = getBrowserName(options.browser);

  const args = browserName === "chromium" ? chromiumArgs : [];
  args.push(...(options.args || []));

  const browser = await playwright[browserName].launch({
    ...pick(options, LAUNCH_OPTIONS),
    args,
    headless: typeof options.headless === "boolean" ? options.headless : false,
  });

  // The better way to do this long term would be to get a "context"
  // event added to Browser class in Playwright.
  const originalNewContext = browser.newContext.bind(browser);
  browser.newContext = async (...args): Promise<BrowserContext> => {
    const context = await originalNewContext(...args);

    await addInitScript(context);

    return context;
  };

  const context = await browser.newContext(
    pick(options, BROWSER_CONTEXT_OPTIONS)
  );

  return { browser, context };
};
