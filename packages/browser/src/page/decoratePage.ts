import { logger } from "@qawolf/logger";
import { omit } from "lodash";
import { Page as PlaywrightPage } from "playwright-core";
import { injectBundle } from "./injectBundle";
import { Page } from "./Page";
import { QAWolfPage } from "./QAWolfPage";

export type DecoratePageOptions = {
  index: number;
  logLevel: string;
  playwrightPage: PlaywrightPage;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export const decoratePage = async (
  options: DecoratePageOptions
): Promise<Page> => {
  logger.verbose(
    `decoratePage: ${JSON.stringify(omit(options, "playwrightPage"))}`
  );

  const page = options.playwrightPage as Page;

  page.qawolf = new QAWolfPage(page, options.index);

  await injectBundle({
    logLevel: options.logLevel,
    page,
    recordDom: options.recordDom,
    recordEvents: options.recordEvents
  });

  return page;
};
