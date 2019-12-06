import { Browser } from "./Browser";
import { createPage } from "../page/createPage";

export const managePages = async (browser: Browser) => {
  const pages = await browser.pages();

  if (pages.length !== 1) {
    // we cannot ensure this.pages is ordered by open time
    // when there are multiple pages open at the start
    throw new Error("Must managePages before opening pages");
  }

  const internal = browser.qawolf;

  const options = {
    device: internal.device,
    recordDom: !!internal.domPath,
    recordEvents: internal.recordEvents
  };

  internal.pages.push(
    await createPage({ ...options, page: pages[0], index: 0 })
  );

  browser.on("targetcreated", async target => {
    const page = await target.page();
    if (page) {
      internal.pages.push(
        await createPage({ ...options, page, index: pages.length })
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
