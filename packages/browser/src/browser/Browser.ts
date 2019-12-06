import { FindOptions, Selector } from "@qawolf/types";
import {
  Browser as PuppeteerBrowser,
  DirectNavigationOptions,
  ElementHandle
} from "puppeteer";
import { InternalBrowser } from "./InternalBrowser";
import { Page } from "../page/Page";
import { FindPageOptions } from "../page/findPage";

// PuppeteerBrowser decorated with our helpers
export interface Browser extends PuppeteerBrowser {
  find: (selector: Selector, options?: FindOptions) => Promise<ElementHandle>;

  goto(
    url: string,
    options?: FindPageOptions & DirectNavigationOptions
  ): Promise<Page>;

  page: (index?: number, timeoutMs?: number) => Promise<Page>;

  // reference to our InternalBrowser for internal use
  _qawolf: InternalBrowser;
}
