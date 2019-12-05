import { FindOptionsBrowser } from "./find/FindOptionsBrowser";
import { registry } from "./registry";
import { DecoratedPage } from "./page/Page";

interface GetPageOptions extends FindOptionsBrowser {
  pageIndex?: number;
}

export const getPage = async (options: GetPageOptions) => {
  if (options.page) return options.page;

  if (!options.browser && registry.browsers.length !== 1) {
    throw new Error(
      "You must specify the browser if there is not only 1 created"
    );
  }

  const browser = options.browser || registry.browsers[0];

  // TODO change to browser.page -> QA Wolf Page
  const decoratedPage: DecoratedPage = await browser.getPage(options.pageIndex);
  return decoratedPage.qawolf;
};
