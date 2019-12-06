import { FindOptions, Selector, ScrollValue } from "@qawolf/types";
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
  click(selector: Selector, options?: FindOptions): Promise<ElementHandle>;

  find: (selector: Selector, options?: FindOptions) => Promise<ElementHandle>;

  goto(
    url: string,
    options?: FindPageOptions & DirectNavigationOptions
  ): Promise<Page>;

  page: (index?: number, timeoutMs?: number) => Promise<Page>;

  scroll(
    selector: Selector,
    value: ScrollValue,
    options?: FindOptions
  ): Promise<ElementHandle>;

  select(
    selector: Selector,
    value: string | null,
    options?: FindOptions
  ): Promise<ElementHandle>;

  type(
    selector: Selector,
    value: string | null,
    options?: FindOptions
  ): Promise<ElementHandle>;

  // reference to our InternalBrowser for internal use
  _qawolf: InternalBrowser;
}
