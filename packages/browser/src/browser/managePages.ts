import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Browser } from "./Browser";
import { createPage } from "../page/createPage";

export const managePages = async (browser: Browser) => {
  const pages = await browser.pages();

  if (pages.length !== 1) {
    // we cannot ensure this.pages is ordered by open time
    // when there are multiple pages open at the start
    throw new Error("Must managePages before opening pages");
  }

  const qawolf = browser.qawolf;

  const options = {
    device: qawolf.device,
    logLevel: qawolf.logLevel,
    recordDom: !!CONFIG.artifactPath,
    recordEvents: qawolf.recordEvents
  };

  qawolf.pages.push(await createPage({ ...options, page: pages[0], index: 0 }));

  browser.on("targetcreated", async target => {
    try {
      const page = await target.page();
      if (page) {
        qawolf.pages.push(
          await createPage({ ...options, page, index: pages.length })
        );
      }
    } catch (e) {
      logger.error(`Could not setup page: ${e}`);
    }
  });

  browser.on("targetdestroyed", async () => {
    // close the browser all pages are closed
    const pages = await browser.pages();

    if (pages.length === 0) {
      await browser.close();
    }
  });
};
