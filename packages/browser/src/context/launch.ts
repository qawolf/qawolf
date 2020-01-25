import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { VirtualCapture } from "@qawolf/screen";
import { DeviceDescriptor } from "playwright-core/lib/types";
import { BrowserContext } from "./BrowserContext";
import { getDevice } from "./device";
import { launchPlaywright, LaunchOptions } from "./launchPlaywright";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

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

const logTestStarted = (context: BrowserContext) => {
  /**
   * Log test started in the context so the timeline is inlined with the other context logs.
   */
  const jasmine = (global as any).jasmine;
  if (!jasmine || !jasmine.qawolf) return;

  jasmine.qawolf.onTestStarted(async (name: string) => {
    try {
      const page = await context.page();
      await page.evaluate((testName: string) => {
        console.log(`jest: ${testName}`);
      }, name);
    } catch (e) {
      logger.debug(`could not log test started: ${e.toString()}`);
    }
  });
};

export const launch = async (
  options: LaunchOptions = {}
): Promise<BrowserContext> => {
  logger.verbose(`launch: ${JSON.stringify(options)}`);

  const device = getDevice(options.device);

  const capture = await createCapture(device, options.headless);

  const playwrightBrowser = await launchPlaywright({
    ...options,
    device,
    display: capture ? capture.xvfb.display : undefined
  });

  const qawolfContext = new QAWolfBrowserContext({
    capture,
    debug: options.debug || CONFIG.debug,
    device,
    logLevel: options.logLevel || CONFIG.logLevel || "error",
    navigationTimeoutMs: options.navigationTimeoutMs,
    playwrightBrowser,
    recordEvents: options.recordEvents
  });

  const context = qawolfContext.decorated;

  if (options.url) await context.goto(options.url);

  logTestStarted(context);

  if (capture) await capture.start();

  return context;
};
