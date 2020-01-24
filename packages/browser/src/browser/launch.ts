import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { VirtualCapture } from "@qawolf/screen";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { Browser } from "./Browser";
import { getDevice } from "./device";
import { launchPlaywright, LaunchOptions } from "./launchPlaywright";
import { managePages } from "./managePages";
import { QAWolfBrowser } from "./QAWolfBrowser";

const createCapture = (device: DeviceDescriptor, headless: boolean = false) => {
  if (!CONFIG.artifactPath || CONFIG.disableVideoArtifact) return null;

  if (headless) {
    logger.info(
      "video capture disabled: cannot capture when the browser is headless"
    );
    return null;
  }

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

const logTestStarted = (browser: Browser) => {
  /**
   * Log test started in the browser so the timeline is inlined with the other browser logs.
   */
  const jasmine = (global as any).jasmine;
  if (!jasmine || !jasmine.qawolf) return;

  jasmine.qawolf.onTestStarted(async (name: string) => {
    try {
      const page = await browser.page();
      await page.evaluate((testName: string) => {
        console.log(`jest: ${testName}`);
      }, name);
    } catch (e) {
      logger.debug(`could not log test started: ${e.toString()}`);
    }
  });
};

export const launch = async (options: LaunchOptions = {}): Promise<Browser> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const device = getDevice(options.device);

  const capture = await createCapture(device, options.headless);

  const playwrightBrowser = await launchPlaywright({
    ...options,
    device,
    display: capture ? capture.xvfb.display : undefined
  });

  const qawolfBrowser = new QAWolfBrowser({
    capture,
    debug: options.debug || CONFIG.debug,
    device,
    logLevel: options.logLevel || CONFIG.logLevel || "error",
    navigationTimeoutMs: options.navigationTimeoutMs,
    playwrightBrowser,
    recordEvents: options.recordEvents
  });

  const browser = qawolfBrowser.browser;

  await managePages(browser);
  if (options.url) await browser.goto(options.url);

  logTestStarted(browser);

  if (capture) await capture.start();

  return browser;
};
