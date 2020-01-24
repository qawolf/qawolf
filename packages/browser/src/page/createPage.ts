import { Page as PlaywrightPage } from "playwright-core";
import { injectBundle } from "./injectBundle";
import { Page } from "./Page";
import { QAWolfPage } from "./QAWolfPage";

export type CreatePageOptions = {
  page: PlaywrightPage;
  index: number;
  logLevel: string;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export const createPage = async (options: CreatePageOptions): Promise<Page> => {
  const { page: playwrightPage } = options;

  const page = playwrightPage as Page;

  page.qawolf = new QAWolfPage(page, options.index);

  await injectBundle({
    logLevel: options.logLevel,
    page,
    recordDom: options.recordDom,
    recordEvents: options.recordEvents
  });

  return page;
};
