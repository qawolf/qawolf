import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import playwright, { Browser } from "playwright";
import { LaunchOptions as PlaywrightLaunchOptions } from "playwright-core/lib/server/browserType";
import { QAWolfContextOptions } from "./QAWolfBrowserContext";
import { getDevice } from "./device";

export type LaunchOptions = PlaywrightLaunchOptions & QAWolfContextOptions;

export const launchPlaywright = async (options: LaunchOptions) => {
  const device = getDevice(options.device);

  const launchOptions: LaunchOptions = {
    args: [
      // TODO figure out default args
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

  if (!options.browser) {
    launchOptions.browser = CONFIG.browser;
  }

  logger.verbose(`launch playwright: ${JSON.stringify(launchOptions)}`);

  let browser: Browser;

  if (launchOptions.browser === "firefox") {
    browser = await playwright.firefox.launch(launchOptions);
  } else if (launchOptions.browser === "webkit") {
    browser = await playwright.webkit.launch(launchOptions);
  } else {
    browser = await playwright.chromium.launch(launchOptions);
  }

  const context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport
  });

  await context.newPage();

  return { browser, context };
};
