import { pick } from "lodash";
import playwright, {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  LaunchOptions as PlaywrightLaunchOptions,
} from "playwright";

import { addInitScript } from "./addInitScript";
import trackingHosts from "./trackingHosts";

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
  "channel",
  "devtools",
  "env",
  "executablePath",
  "firefoxUserPrefs",
  "proxy",
  "slowMo",
  "timeout",
] as const;

const BROWSER_NAMES = ["chrome", "chromium", "firefox", "webkit"] as const;

export type BrowserName = typeof BROWSER_NAMES[number];

export type LaunchOptions = Pick<
  BrowserContextOptions,
  typeof BROWSER_CONTEXT_OPTIONS[number]
> &
  Pick<PlaywrightLaunchOptions, typeof LAUNCH_OPTIONS[number]> & {
    allowTracking?: boolean;
    browser?: BrowserName;
    headless?: boolean;
  };

export type LaunchResult = {
  browser: Browser;
  context: BrowserContext;
};

export const getBrowserLaunchOptions = (
  name: BrowserName,
  options: LaunchOptions
): LaunchOptions => {
  const args = ["chrome", "chromium"].includes(name)
    ? [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--window-position=0,0",
      ]
    : [];

  args.push(...(options.args || []));

  const launchOptions = {
    ...pick(options, LAUNCH_OPTIONS),
    args,
    headless: typeof options.headless === "boolean" ? options.headless : false,
  };

  if (name === "chrome") {
    launchOptions.channel = "chrome";
  }

  return launchOptions;
};

export const getBrowserName = (name?: string): BrowserName => {
  const providedName = name || process.env.QAWOLF_BROWSER;

  if (providedName && BROWSER_NAMES.includes(providedName as BrowserName)) {
    return providedName as BrowserName;
  }

  return "chrome";
};

export const launch = async (
  options: LaunchOptions = {}
): Promise<LaunchResult> => {
  const browserName = getBrowserName(options.browser);

  const browserType = browserName === "chrome" ? "chromium" : browserName;
  const launchOptions = getBrowserLaunchOptions(browserName, options);

  const browser = await playwright[browserType].launch(launchOptions);

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

  if (!options.allowTracking) {
    await context.route(
      (url) => trackingHosts.has(url.hostname),
      (route) => route.abort("aborted")
    );
  }

  return { browser, context };
};
