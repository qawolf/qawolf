import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Capture, Display } from "@qawolf/screen";
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

const buildCaptureOptions = (device: Device) => {
  const offset = {
    x: CONFIG.chromeOffsetX,
    y: CONFIG.chromeOffsetY
  };

  // ffmpeg video size must be divisibble by 2
  const captureSize = {
    height: makeEven(device.viewport.height),
    width: makeEven(device.viewport.width)
  };

  const displaySize = {
    height: captureSize.height + offset.y,
    width: captureSize.width + offset.x
  };

  return { captureSize, displaySize, offset };
};

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const device = getDevice(options.device);

  const captureOptions = buildCaptureOptions(device);

  // if on linux & CI: use a virtual display
  let display = null;
  const isCI = true;
  const isLinux = true;
  if (isCI && isLinux && !options.headless) {
    try {
      display = await Display.start(captureOptions.displaySize);
    } catch (e) {}
  }

  const puppeteerBrowser = await launchPuppeteer(options, device);

  const qawolfBrowser = new QAWolfBrowser({
    debug: options.debug || CONFIG.debug,
    device,
    display,
    navigationTimeoutMs: options.navigationTimeoutMs,
    puppeteerBrowser,
    recordEvents: options.recordEvents
  });

  const browser = qawolfBrowser.browser;

  await managePages(browser);
  if (options.url) await browser.goto(options.url);

  // start capture after goto
  const videoPath = CONFIG.artifactPath;
  if (display && videoPath) {
    qawolfBrowser._capture = await Capture.start({
      display,
      offset: captureOptions.offset,
      savePath: videoPath,
      size: captureOptions.captureSize
    });
  }

  return browser;
};

const makeEven = (x: number) => {
  return Math.ceil(x / 2) * 2;
};
