import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { DecoratedBrowser } from "./Browser";
import { createDomReplayer } from "../page/domReplayer";

export const closeBrowser = async (
  browser: DecoratedBrowser
): Promise<void> => {
  if (CONFIG.debug) {
    logger.verbose("Browser: skipping close in debug mode");
    return;
  }

  logger.verbose("Browser: close");

  if (browser.qawolf.domPath) {
    await Promise.all(
      browser.qawolf.pages.map((page, index) =>
        createDomReplayer(page, `${browser.qawolf.domPath}/page_${index}.html`)
      )
    );
  }

  browser.qawolf.pages.forEach(page => page.qawolf.dispose());

  await browser.qawolf.close();
  logger.verbose("Browser: closed");
};
