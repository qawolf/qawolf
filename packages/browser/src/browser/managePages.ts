import { DecoratedBrowser } from "./Browser";
import { Page } from "../page/Page";

export const managePages = async (browser: DecoratedBrowser) => {
  const pages = await browser.pages();

  if (pages.length !== 1) {
    // we cannot ensure this.pages is ordered by open time
    // when there are multiple pages open at the start
    throw new Error("Must managePages before opening pages");
  }

  const options = {
    device: browser.qawolf.device,
    recordDom: !!browser.qawolf.domPath,
    recordEvents: browser.qawolf.recordEvents
  };

  browser.qawolf.pages.push(
    await Page.create({ ...options, page: pages[0], index: 0 })
  );

  browser.on("targetcreated", async target => {
    const page = await target.page();
    if (page) {
      browser.qawolf.pages.push(
        await Page.create({ ...options, page, index: pages.length })
      );
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
