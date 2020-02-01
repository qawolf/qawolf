import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { VirtualCapture } from "@qawolf/screen";
import { BrowserType, getBrowserType } from "@qawolf/types";
import playwright from "playwright";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { LaunchOptions as PlaywrightLaunchOptions } from "playwright-core/lib/server/browserType";
import { getDevice } from "./device";
import {
  CreateContextOptions,
  QAWolfBrowserContext
} from "./QAWolfBrowserContext";

export type LaunchOptions = PlaywrightLaunchOptions &
  Omit<CreateContextOptions, "device"> & {
    browser?: BrowserType;
    device?: DeviceDescriptor | string;
  };

export const buildLaunchOptions = (options: LaunchOptions) => {
  const device = getDevice(options.device);

  const launchOptions = {
    args: [
      // TODO figure out default args for playwright browsers
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0",
      `--window-size=${device.viewport.width + CONFIG.chromeOffsetX},${device
        .viewport.height + CONFIG.chromeOffsetY}`
    ],
    ...options,
    browser: getBrowserType(options.browser || CONFIG.browser),
    device,
    headless: options.headless || CONFIG.headless
  };

  return launchOptions;
};

export const createCapture = (
  device: DeviceDescriptor,
  headless: boolean = false
) => {
  if (!CONFIG.artifactPath || CONFIG.disableVideoArtifact) return null;

  if (headless) {
    logger.info(
      "video capture disabled: cannot capture when the browser is headless"
    );
    return null;
  }

  return VirtualCapture.create({
    offset: {
      // TODO need to update for all new browsers
      x: CONFIG.chromeOffsetX,
      y: CONFIG.chromeOffsetY
    },
    savePath: CONFIG.artifactPath,
    size: {
      height: device.viewport.height,
      width: device.viewport.width
    }
  });
};

export const launch = async (options: LaunchOptions = {}) => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const launchOptions = buildLaunchOptions(options);

  const capture = await createCapture(
    launchOptions.device,
    launchOptions.headless
  );

  if (capture) {
    launchOptions.env = {
      ...launchOptions.env,
      DISPLAY: capture.xvfb.display
    };
  }

  logger.verbose(`launch: browser ${JSON.stringify(launchOptions)}`);
  try {
    const playwrightBrowser = await playwright[launchOptions.browser!].launch(
      launchOptions
    );

    return QAWolfBrowserContext.create(playwrightBrowser, launchOptions);
  } catch (e) {
    logger.error(`launch: failed ${e.toString()}`);
    throw e;
  }
};
