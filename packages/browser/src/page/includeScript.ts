import { logger } from "@qawolf/logger";
import { Page } from "playwright-core";
import { retryExecutionError } from "../retry";

export const includeScript = async (page: Page, script: string) => {
  try {
    await Promise.all([
      retryExecutionError(() => page.evaluate(script)),
      page.evaluateOnNewDocument(script)
    ]);
  } catch (e) {
    logger.debug(`includeScript: error ${e.message}`);

    if (page.isClosed()) {
      // ignore error if the page is closed
      return;
    }

    throw e;
  }
};
