import { logger } from "@qawolf/logger";
import { readFileSync } from "fs-extra";
import { dirname, resolve } from "path";
import { Page } from "playwright-core";
import { retryExecutionError } from "../retry";

interface BundleOptions {
  logLevel: string;
  page: Page;
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

export const injectBundle = async (options: BundleOptions) => {
  const page = options.page;

  try {
    const bundle = QAWOLF_JS + buildCaptureLogsJs(options.logLevel);

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
