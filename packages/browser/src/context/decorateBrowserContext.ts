import { BrowserContext as PlaywrightBrowserContext } from "playwright-core";
import { BrowserContext } from "./BrowserContext";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

export const decorateBrowserContext = (
  playwrightContext: PlaywrightBrowserContext,
  qawolfContext: QAWolfBrowserContext
): BrowserContext => {
  /**
   * Decorate BrowserContext with our helpers.
   */
  const context = playwrightContext as BrowserContext;

  context.click = qawolfContext.click.bind(qawolfContext);

  // set original _close method before we clobber it
  context._close = context.close;
  context.close = qawolfContext.close.bind(qawolfContext);

  context.find = qawolfContext.find.bind(qawolfContext);
  context.findProperty = qawolfContext.findProperty.bind(qawolfContext);
  context.goto = qawolfContext.goto.bind(qawolfContext);
  context.hasText = qawolfContext.hasText.bind(qawolfContext);
  context.page = qawolfContext.page.bind(qawolfContext);
  context.scroll = qawolfContext.scroll.bind(qawolfContext);
  context.select = qawolfContext.select.bind(qawolfContext);
  context.type = qawolfContext.type.bind(qawolfContext);
  context.qawolf = qawolfContext;

  return context;
};
