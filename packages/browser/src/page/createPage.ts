import { devices, Page as PuppeteerPage } from "puppeteer";
import { injectBundle } from "./injectBundle";
import { Page } from "./Page";
import { QAWolfPage } from "./QAWolfPage";

export type CreatePageOptions = {
  device: devices.Device;
  page: PuppeteerPage;
  index: number;
  logLevel: string;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export const createPage = async (options: CreatePageOptions): Promise<Page> => {
  const { device, page: puppeteerPage } = options;

  const page = puppeteerPage as Page;

  page.qawolf = new QAWolfPage(page, options.index);

  await Promise.all([
    puppeteerPage.emulate(device),
    injectBundle({
      logLevel: options.logLevel,
      page,
      recordDom: options.recordDom,
      recordEvents: options.recordEvents
    })
  ]);

  return page;
};
