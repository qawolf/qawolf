import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { BrowserType, getBrowserType } from "@qawolf/types";
import { platform } from "os";
import playwright from "playwright-core";
import { LaunchOptions as PlaywrightLaunchOptions } from "playwright-core/lib/server/browserType";
import { register } from "./managers/ContextManager";

export type LaunchOptions = PlaywrightLaunchOptions & {
  browser?: BrowserType;
};

// TODO refactor for jest-playwright
export const launch = async (options: LaunchOptions = {}) => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const browserType = getBrowserType(options.browser || CONFIG.browser);

  let args: string[] = [];
  if (browserType === "chromium") {
    args = [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0"
    ];

    if (platform() === "linux") {
      // We use --no-sandbox because we cannot change the USER for certain CIs (like GitHub).
      // "Ensure your Dockerfile does not set the USER instruction, otherwise you will not be able to access GITHUB_WORKSPACE"
      args.push("--no-sandbox");
    }
  }

  const browser = await playwright[browserType].launch({
    args,
    headless: options.headless || CONFIG.headless,
    ...options
  });

  const context = register(browser._defaultContext);

  // bring the first page to front (if possible)
  // we do this in case it is a short test with only one action
  // to make sure the browser shows up in the video
  const page = await context.qawolf().findPage({ page: 0 });
  await page.qawolf().bringToFront();

  return { browser, context };
};
