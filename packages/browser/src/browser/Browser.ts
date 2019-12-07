import { FindOptions, Selector, ScrollValue } from "@qawolf/types";
import {
  Browser as PuppeteerBrowser,
  DirectNavigationOptions,
  ElementHandle
} from "puppeteer";
import { InternalBrowser } from "./InternalBrowser";
import { FindPageOptions } from "../page/findPage";
import { Page } from "../page/Page";

// PuppeteerBrowser decorated with our helpers
export interface Browser extends PuppeteerBrowser {
  click(selector: Selector, options?: FindOptions): Promise<ElementHandle>;

  find: (selector: Selector, options?: FindOptions) => Promise<ElementHandle>;

  findProperty: (
    selector: Selector,
    property: string,
    options?: FindOptions
  ) => Promise<ElementHandle>;

  goto(
    url: string,
    options?: FindPageOptions & DirectNavigationOptions
  ): Promise<Page>;

  hasText(
    text: string,
    options?: FindOptions,
    pageIndex?: number
  ): Promise<boolean>;

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
  qawolf: InternalBrowser;

  // reference to original PuppeteerBrowser.close method
  _close(): Promise<void>;
}
