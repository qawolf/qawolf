import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import playwright, { Browser, BrowserContext } from "playwright-core";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { getDevice } from "./device";

// TODO open issue about exporting these types
import { LaunchOptions as ChromiumLaunchOptions } from "playwright-core/lib/server/crPlaywright";
import { LaunchOptions as FirefoxLaunchOptions } from "playwright-core/lib/server/ffPlaywright";
import { LaunchOptions as WebkitLaunchOptions } from "playwright-core/lib/server/wkPlaywright";

type BrowserType = "chromium" | "firefox" | "webkit";

export interface QAWolfLaunchOptions {
  browser?: BrowserType;
  debug?: boolean;
  device?: string | DeviceDescriptor;
  display?: string;
  logLevel?: string;
  navigationTimeoutMs?: number;
  recordEvents?: boolean;
  url?: string;
}

export type LaunchOptions =
  | (ChromiumLaunchOptions & QAWolfLaunchOptions)
  | (FirefoxLaunchOptions & QAWolfLaunchOptions)
  | (WebkitLaunchOptions & QAWolfLaunchOptions);

export const launchPlaywright = async (
  options: LaunchOptions
): Promise<BrowserContext> => {
  const device = getDevice(options.device);

  const launchOptions: LaunchOptions = {
    args: [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0",
      `--window-size=${device.viewport.width + CONFIG.chromeOffsetX},${device
        .viewport.height + CONFIG.chromeOffsetY}`
    ],
    headless: CONFIG.headless,
    ...options
  };

  if (options.display) {
    launchOptions.env = {
      ...process.env,
      DISPLAY: options.display
    };
  }

  // TODO check defaultViewport: null
  logger.verbose(`launch playwright: ${JSON.stringify(launchOptions)}`);

  let browser: Browser;

  if (options.browser === "firefox") {
    browser = await playwright.firefox.launch(launchOptions);
  } else if (options.browser === "webkit") {
    browser = await playwright.webkit.launch(launchOptions);
  } else {
    browser = await playwright.chromium.launch(launchOptions);
  }

  const context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport
  });

  return context;
};
