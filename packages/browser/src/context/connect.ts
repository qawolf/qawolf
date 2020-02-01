import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { BrowserType, getBrowserType } from "@qawolf/types";
import playwright from "playwright";
import { ConnectOptions as PlaywrightConnectOptions } from "playwright-core/lib/browser";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { getDevice } from "./device";
import {
  CreateContextOptions,
  QAWolfBrowserContext
} from "./QAWolfBrowserContext";

export type ConnectOptions = PlaywrightConnectOptions &
  Omit<CreateContextOptions, "device"> & {
    browser?: BrowserType;
    device?: DeviceDescriptor | string;
  };

export const connect = async (options: ConnectOptions) => {
  const browserType = getBrowserType(options.browser || CONFIG.browser);

  const createOptions = {
    ...options,
    device: getDevice(options.device)
  };

  logger.verbose(`connect: ${JSON.stringify(createOptions)}`);

  try {
    const playwrightBrowser = await playwright[browserType].connect(options);
    return QAWolfBrowserContext.create(playwrightBrowser, createOptions);
  } catch (e) {
    logger.error(`connect: failed ${e.toString()}`);
    throw e;
  }
};
