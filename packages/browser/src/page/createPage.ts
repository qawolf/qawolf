import { devices, Page as PuppeteerPage } from "puppeteer";
import { captureLogs } from "./captureLogs";
import { injectBundle } from "./injectBundle";
import { InternalPage } from "./InternalPage";
import { Page } from "./Page";

export type CreatePageOptions = {
  device: devices.Device;
  page: PuppeteerPage;
  index: number;
  recordDom?: boolean;
  recordEvents?: boolean;
};

export const createPage = async (options: CreatePageOptions): Promise<Page> => {
  const { device, page: puppeteerPage } = options;

  const page = puppeteerPage as Page;

  page.qawolf = new InternalPage(page, options.index);

  await Promise.all([
    captureLogs(page),
    injectBundle(page, !!options.recordDom, !!options.recordEvents),
    puppeteerPage.emulate(device)
  ]);

  return page;
};
