import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { ScreenCapture } from "@qawolf/screen";
import { platform } from "os";
import { basename } from "path";
import {
  launch as launchPuppeteerBrowser,
  LaunchOptions as PuppeteerLaunchOptions
} from "puppeteer";
import { Device } from "puppeteer/DeviceDescriptors";
import { Browser } from "./Browser";
import { getDevice } from "./device";
import { managePages } from "./managePages";
import { QAWolfBrowser } from "./QAWolfBrowser";

export type LaunchOptions = {
  device?: string | Device;
  domPath?: string;
  recordEvents?: boolean;
  url?: string;
  videoPath?: string;
} & PuppeteerLaunchOptions;

const buildPuppeteerOptions = (
  options: PuppeteerLaunchOptions,
  device: Device
) => {
  const launchOptions: PuppeteerLaunchOptions = {
    args: [
      "--disable-dev-shm-usage",
      "--no-default-browser-check",
      "--window-position=0,0",
      `--window-size=${device.viewport.width + CONFIG.chromeOffsetX},${device
        .viewport.height + CONFIG.chromeOffsetY}`
    ],
    defaultViewport: null,
    headless: CONFIG.headless,
    ...options
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

  const device = getDevice(options.device);

  const browser = (await launchPuppeteerBrowser(
    buildPuppeteerOptions(options, device)
  )) as Browser;
  // set original _close method before we clobber it
  browser._close = browser.close;

  const qawolf = new QAWolfBrowser({
    ...options,
    browser,
    device
  });

  // decorate Browser with our helpers
  browser.click = qawolf.click.bind(qawolf);
  browser.close = qawolf.close.bind(qawolf);
  browser.find = qawolf.find.bind(qawolf);
  browser.findProperty = qawolf.findProperty.bind(qawolf);
  browser.goto = qawolf.goto.bind(qawolf);
  browser.hasText = qawolf.hasText.bind(qawolf);
  browser.page = qawolf.page.bind(qawolf);
  browser.scroll = qawolf.scroll.bind(qawolf);
  browser.select = qawolf.select.bind(qawolf);
  browser.type = qawolf.type.bind(qawolf);
  browser.qawolf = qawolf;

  await managePages(browser);

  if (options.url) await qawolf.goto(options.url);

  const videoPath = options.videoPath || CONFIG.videoPath;
  if (videoPath) {
    // start capture after goto
    qawolf._screenCapture = await ScreenCapture.start({
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
