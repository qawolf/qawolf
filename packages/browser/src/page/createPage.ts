import { devices, Page as PlaywrightPage } from "playwright";
import { injectBundle } from "./injectBundle";
import { Page } from "./Page";
import { QAWolfPage } from "./QAWolfPage";

export type CreatePageOptions = {
  device: devices.Device;
  page: PlaywrightPage;
  index: number;
  logLevel: string;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export const createPage = async (options: CreatePageOptions): Promise<Page> => {
  const { device, page: playwrightPage } = options;

  const page = playwrightPage as Page;

  page.qawolf = new QAWolfPage(page, options.index);

  await Promise.all([
    playwrightPage.emulate(device),
    injectBundle({
      logLevel: options.logLevel,
      page,
      recordDom: options.recordDom,
      recordEvents: options.recordEvents
    })
  ]);

  return page;
};
