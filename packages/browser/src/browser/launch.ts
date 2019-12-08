import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import { Size } from "@qawolf/types";
import { platform } from "os";
import { basename } from "path";
import {
  launch as launchPuppeteerBrowser,
  LaunchOptions as PuppeteerLaunchOptions
} from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { Browser } from "./Browser";
import { getDevice } from "./device";
import { InternalBrowser } from "./InternalBrowser";
import { managePages } from "./managePages";

export type LaunchOptions = {
  domPath?: string;
  recordEvents?: boolean;
  size?: Size;
  url?: string;
  videoPath?: string;
};

const buildPuppeteerOptions = (device: Device) => {
  const launchOptions: PuppeteerLaunchOptions = {
    args: [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0",
      `--window-size=${device.viewport.width + CONFIG.chromeOffsetX},${device
        .viewport.height + CONFIG.chromeOffsetY}`
    ],
    defaultViewport: null,
    headless: CONFIG.headless
  };

  if (platform() === "linux") {
    launchOptions!.args!.push("--disable-gpu");
    launchOptions!.args!.push("--disable-setuid-sandbox");
    launchOptions!.args!.push("--no-sandbox");
  }

  if (CONFIG.chromeExecutablePath) {
    launchOptions.executablePath = CONFIG.chromeExecutablePath;
  }

  return launchOptions;
};

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const device = getDevice(options.size);

  const browser = (await launchPuppeteerBrowser(
    buildPuppeteerOptions(device)
  )) as Browser;
  // set original _close method before we clobber it
  browser._close = browser.close;

  const internal = new InternalBrowser({
    ...options,
    browser,
    device
  });

  // decorate Browser with our helpers
  browser.click = internal.click.bind(internal);
  browser.close = internal.close.bind(internal);
  browser.find = internal.find.bind(internal);
  browser.findProperty = internal.findProperty.bind(internal);
  browser.goto = internal.goto.bind(internal);
  browser.hasText = internal.hasText.bind(internal);
  browser.page = internal.page.bind(internal);
  browser.scroll = internal.scroll.bind(internal);
  browser.select = internal.select.bind(internal);
  browser.type = internal.type.bind(internal);
  browser.qawolf = internal;

  await managePages(browser);

  if (options.url) await internal.goto(options.url);

  const videoPath = options.videoPath || CONFIG.videoPath;
  if (videoPath) {
    // start capture after goto
    internal._screenCapture = await ScreenCapture.start({
      offset: {
        x: CONFIG.chromeOffsetX,
        y: CONFIG.chromeOffsetY
      },
      savePath: `${CONFIG.videoPath}/${basename(require.main!.filename)}`,
      size: {
        height: device.viewport.height,
        width: device.viewport.width
      }
    });
  }

  return browser;
};
