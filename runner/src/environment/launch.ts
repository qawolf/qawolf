import { pick } from "lodash";
import playwright, {
  Browser,
  BrowserContext,
  BrowserContextOptions,
} from "playwright";

import { addInitScript } from "./addInitScript";

const BROWSER_OPTIONS = [
  "args",
  "devtools",
  "env",
  "firefoxUserPrefs",
  "proxy",
  "slowMo",
  "timeout",
];

const CONTEXT_OPTIONS = [
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

const BROWSER_NAMES = ["chromium", "firefox", "webkit"] as const;

export type BrowserName = typeof BROWSER_NAMES[number];

export type LaunchOptions = Pick<
  BrowserContextOptions,
  typeof CONTEXT_OPTIONS[number]
> & {
  args?: string[];
  browser?: BrowserName;
  devtools?: boolean;
  headless?: boolean;
  slowMo?: number;
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
    ...pick(options, BROWSER_OPTIONS),
    args,
    devtools: typeof options.devtools === "boolean" ? options.devtools : false,
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

  const context = await browser.newContext(pick(options, CONTEXT_OPTIONS));

  return { browser, context };
};
