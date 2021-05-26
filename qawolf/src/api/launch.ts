import { platform } from "os";
import playwright, {
  Browser,
  BrowserContext,
  BrowserContextOptions,
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

export const getLaunchOptions = (
  browserName: BrowserName,
  options: LaunchOptions = {}
): LaunchOptions => {
  const launchOptions = {
    ...options,
  };

  const defaultArgs: string[] = [];

  if (["chrome", "chromium"].includes(browserName) && platform() === "linux") {
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

  const browserType = browserName === "chrome" ? "chromium" : browserName;
  const browser = await playwright[browserType].launch(launchOptions);

  const context = await browser.newContext(pick(options, CONTEXT_OPTIONS));

  return { browser, context };
};
