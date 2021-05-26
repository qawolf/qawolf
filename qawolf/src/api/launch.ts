import { platform } from "os";
import playwrightCore, {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  BrowserType,
  LaunchOptions,
} from "playwright";
import { pick } from "../utils";

const CONTEXT_OPTIONS = [
  "bypassCSP",
  "colorScheme",
  "deviceScaleFactor",
  "extraHTTPHeaders",
  "geolocation",
  "hasTouch",
  "httpCredentials",
  "ignoreHTTPSErrors",
  "timezoneId",
  "locale",
  "permissions",
  "userAgent",
  "viewport",
  "isMobile",
] as const;

type BrowserName = "chrome" | "chromium" | "firefox" | "webkit";

export type QAWolfLaunchOptions = Pick<
  BrowserContextOptions,
  typeof CONTEXT_OPTIONS[number]
> & {
  browser?: BrowserName;
  headless?: boolean;
};

export type LaunchResult = {
  browser: Browser;
  context: BrowserContext;
};

export const parseBrowserName = (name?: string): BrowserName => {
  if (name === "chromium" || name === "firefox" || name === "webkit") {
    return name;
  }

  return "chrome";
};

export const getBrowserType = (
  browserName: BrowserName
): BrowserType<Browser> => {
  // We must use the browser type from the installed `playwright` or `playwright-browser` package,
  // and not `playwright-core` since they store different browser binaries.
  // See https://github.com/microsoft/playwright/issues/1191 for more details.
  let playwright: typeof playwrightCore;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    playwright = require("playwright");
  } catch (error) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      playwright = require(`playwright-${browserName}`);
    } catch (error) {
      throw new Error("qawolf requires playwright to be installed");
    }
  }

  return playwright[browserName];
};

export const getLaunchOptions = (
  browserName: BrowserName,
  options: LaunchOptions = {}
): LaunchOptions => {
  const launchOptions = {
    ...options,
  };

  const defaultArgs: string[] = [];

  if (browserName === "chromium" && platform() === "linux") {
    // We use --no-sandbox because we cannot change the USER for certain CIs (like GitHub).
    // "Ensure your Dockerfile does not set the USER instruction, otherwise you will not be able to access GITHUB_WORKSPACE"
    defaultArgs.push("--no-sandbox");
  }

  return {
    args: defaultArgs,
    // override args if they are provided
    ...launchOptions,
  };
};

export const launch = async (
  options: QAWolfLaunchOptions = {}
): Promise<LaunchResult> => {
  const browserName = parseBrowserName(
    options.browser || process.env.QAWOLF_BROWSER
  );
  const launchOptions = getLaunchOptions(browserName, options);

  const browser = await getBrowserType(browserName).launch(launchOptions);

  const context = await browser.newContext(pick(options, CONTEXT_OPTIONS));

  return { browser, context };
};
