import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Display, Capture } from "@qawolf/screen";
import { basename } from "path";
import { LaunchOptions as PuppeteerLaunchOptions } from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { Browser } from "./Browser";
import { getDevice } from "./device";
import { launchPuppeteer } from "./launchPuppeteer";
import { managePages } from "./managePages";
import { QAWolfBrowser } from "./QAWolfBrowser";

const buildCaptureOptions = (device: Device) => {
  const offset = {
    x: CONFIG.chromeOffsetX,
    y: CONFIG.chromeOffsetY
  };

  const captureSize = {
    height: device.viewport.height,
    width: device.viewport.width
  };

  const displaySize = {
    height: captureSize.height + offset.y,
    width: captureSize.width + offset.x
  };

  return { captureSize, displaySize, offset };
};

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

  const device = getDevice(options.device);

  const captureOptions = buildCaptureOptions(device);

  let display = null;
  const videoPath = options.videoPath || CONFIG.videoPath;

  if (videoPath) {
    try {
      display = await Display.start(captureOptions.displaySize);
      // check if xvfb is changing parent env
      console.log("process.env.DISPLAY", process.env.DISPLAY);
      process.env.DISPLAY = display.value;
      console.log("after we set process.env.DISPLAY", process.env.DISPLAY);

      // ignore headless since we create the browser on a virtual display
      options.headless = false;
    } catch (e) {}
  }

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

  // start capture after goto
  if (display && videoPath) {
    // TODO basename(require.main!.filename) -> helper
    qawolfBrowser._capture = await Capture.start({
      display,
      offset: captureOptions.offset,
      savePath: `${videoPath}/${basename(require.main!.filename)}`,
      size: captureOptions.captureSize
    });
  }

  return browser;
};
