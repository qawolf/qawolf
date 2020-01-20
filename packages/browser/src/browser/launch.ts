import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { VirtualCapture } from "@qawolf/screen";
import { LaunchOptions as PuppeteerLaunchOptions } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { Browser } from "./Browser";
import { getDevice } from "./device";
import { launchPuppeteer } from "./launchPuppeteer";
import { managePages } from "./managePages";
import { QAWolfBrowser } from "./QAWolfBrowser";

export type LaunchOptions = {
  debug?: boolean;
  device?: string | Device;
  navigationTimeoutMs?: number;
  recordEvents?: boolean;
  url?: string;
} & PuppeteerLaunchOptions;

const createCapture = (device: Device, headless: boolean = false) => {
  if (headless || !CONFIG.artifactPath) return null;

  return VirtualCapture.create({
    offset: {
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

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const device = getDevice(options.device);

  const capture = await createCapture(device, options.headless);

  const puppeteerBrowser = await launchPuppeteer({
    ...options,
    device,
    display: capture ? capture.xvfb.display : undefined
  });

  const qawolfBrowser = new QAWolfBrowser({
    capture,
    debug: options.debug || CONFIG.debug,
    device,
    navigationTimeoutMs: options.navigationTimeoutMs,
    puppeteerBrowser,
    recordEvents: options.recordEvents
  });

  const browser = qawolfBrowser.browser;

  await managePages(browser);
  if (options.url) await browser.goto(options.url);

  if (capture) await capture.start();

  return browser;
};
