import { CONFIG } from "@qawolf/config";
import { browserLogger, logger } from "@qawolf/logger";
import { ElementEvent } from "@qawolf/types";
import { readFileSync } from "fs-extra";
import { dirname, resolve } from "path";
import { Page } from "./Page";
import { retryExecutionError } from "../retry";

interface BundleOptions {
  logLevel: string;
  page: Page;
  shouldRecordEvents?: boolean;
}

const QAWOLF_JS = readFileSync(
  resolve(dirname(require.resolve("@qawolf/web")), "./qawolf.web.js"),
  "utf8"
)
  // only inject once
  .replace("var qawolf =", "window.qawolf = window.qawolf ||");

const buildCaptureLogsJs = (logLevel: string) => {
  return `
  if (!window.qaw_captureLogs) {
    window.qaw_captureLogs = true;
    window.qawolf.captureLogs("${logLevel}", window.qaw_log);
  }`;
};

const buildRecordEventsJs = (pageIndex: number) =>
  `window.qaw_recorder = window.qaw_recorder || new qawolf.Recorder("${CONFIG.attribute}", ${pageIndex}, (event) => qaw_onRecordEvent(event));`;

export const bundleJs = (options: BundleOptions) => {
  let bundle = QAWOLF_JS;

  bundle += buildCaptureLogsJs(options.logLevel);

  if (options.shouldRecordEvents) {
    bundle += buildRecordEventsJs(options.page.qawolf().index());
  }

  return bundle;
};

export const captureEvents = async (page: Page) => {
  await page.exposeFunction("qaw_onRecordEvent", (event: ElementEvent) =>
    page.qawolf()._onRecordEvent(event)
  );
};

export const captureLogs = async (page: Page) => {
  await page.exposeFunction("qaw_log", (level: string, message: string) => {
    browserLogger.log(level, message);
  });
};

export const injectBundle = async (options: BundleOptions) => {
  const page = options.page;

  try {
    const bundle = bundleJs(options);

    const functionPromises = [captureLogs(page)];

    if (options.shouldRecordEvents) {
      functionPromises.push(captureEvents(page));
    }

    await Promise.all(functionPromises);

    await Promise.all([
      retryExecutionError(() => page.evaluate(bundle)),
      page.evaluateOnNewDocument(bundle)
    ]);
  } catch (e) {
    logger.debug(`injectBundle: error ${e.message}`);

    if (page.isClosed()) {
      // ignore error if the page is closed
      return;
    }

    throw e;
  }
};
