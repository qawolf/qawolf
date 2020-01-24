import { BrowserContext as PlaywrightBrowserContext } from "playwright-core";
import { Browser } from "./Browser";
import { QAWolfBrowser } from "./QAWolfBrowser";

export const decorateBrowser = (
  playwrightBrowser: PlaywrightBrowserContext,
  qawolfBrowser: QAWolfBrowser
): Browser => {
  /**
   * Decorate Browser with our helpers.
   */
  const browser = playwrightBrowser as Browser;

  browser.click = qawolfBrowser.click.bind(qawolfBrowser);

  // set original _close method before we clobber it
  browser._close = browser.close;
  browser.close = qawolfBrowser.close.bind(qawolfBrowser);

  browser.find = qawolfBrowser.find.bind(qawolfBrowser);
  browser.findProperty = qawolfBrowser.findProperty.bind(qawolfBrowser);
  browser.goto = qawolfBrowser.goto.bind(qawolfBrowser);
  browser.hasText = qawolfBrowser.hasText.bind(qawolfBrowser);
  browser.page = qawolfBrowser.page.bind(qawolfBrowser);
  browser.scroll = qawolfBrowser.scroll.bind(qawolfBrowser);
  browser.select = qawolfBrowser.select.bind(qawolfBrowser);
  browser.type = qawolfBrowser.type.bind(qawolfBrowser);
  browser.qawolf = qawolfBrowser;

  return browser;
};
