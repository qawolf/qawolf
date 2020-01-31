import { CONFIG } from "@qawolf/config";
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
  // TODO consider how to deal with capture on connected browser
  const browserType = getBrowserType(options.browser || CONFIG.browser);
  const playwrightBrowser = await playwright[browserType].connect(options);
  const device = getDevice(options.device);

  return QAWolfBrowserContext.create(playwrightBrowser, {
    ...options,
    device
  });
};
