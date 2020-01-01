import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { LaunchOptions as PuppeteerLaunchOptions } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { Browser } from "./Browser";
import { startCapture } from "./capture";
import { getDevice } from "./device";
import { launchPuppeteer } from "./launchPuppeteer";
import { managePages } from "./managePages";
import { QAWolfBrowser } from "./QAWolfBrowser";

export type LaunchOptions = {
  debug?: boolean;
  device?: string | Device;
  domPath?: string;
  navigationTimeoutMs?: number;
  recordEvents?: boolean;
  url?: string;
  videoPath?: string;
} & PuppeteerLaunchOptions;

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const videoPath = options.videoPath || CONFIG.videoPath;

  //   // const puppeteerOptions = buildLaunchOptions(options, device);
  //   // if there is a video path create a virtual display and ignore headless
  //   const videoPath = options.videoPath || CONFIG.videoPath;
  //   if (videoPath) {
  //     // todo create display
  //     // todo check if xvfb is changing parent env
  //     // todo headless=false if success....
  //   }

  const device = getDevice(options.device);

  const puppeteerBrowser = await launchPuppeteer(options, device);

  const qawolfBrowser = new QAWolfBrowser({
    debug: options.debug || CONFIG.debug,
    device,
    domPath: options.domPath || CONFIG.domPath,
    navigationTimeoutMs:
      options.navigationTimeoutMs || CONFIG.navigationTimeoutMs,
    puppeteerBrowser,
    recordEvents: options.recordEvents
  });

  const browser = qawolfBrowser.browser;

  await managePages(browser);
  if (options.url) await browser.goto(options.url);

  if (videoPath) await startCapture(browser.qawolf, videoPath);

  return browser;
};
