import {
  FindElementOptions,
  FindPageOptions,
  Selector,
  ScrollValue,
  TypeOptions
} from "@qawolf/types";
import {
  Browser as PlaywrightBrowser,
  BrowserContext as PlaywrightBrowserContext,
  ElementHandle
} from "playwright-core";
import { GotoOptions } from "playwright-core/lib/frames";
import { ClickOptions } from "../actions/clickElement";
import { Page } from "../page/Page";
import { QAWolfBrowserContext } from "./QAWolfBrowserContext";

// playwright BrowserContext decorated with our helpers
export interface BrowserContext extends PlaywrightBrowserContext {
  browser: PlaywrightBrowser;

  click(
    selector: Selector,
    options?: FindElementOptions & ClickOptions
  ): Promise<ElementHandle>;

  find: (
    selector: Selector,
    options?: FindElementOptions
  ) => Promise<ElementHandle>;

  findProperty: (
    selector: Selector,
    property: string,
    options?: FindElementOptions
  ) => Promise<ElementHandle>;

  goto(url: string, options?: FindPageOptions & GotoOptions): Promise<Page>;

  hasText(text: string, options?: FindPageOptions): Promise<boolean>;

  page: (options?: FindPageOptions) => Promise<Page>;

  scroll(
    selector: Selector,
    value: ScrollValue,
    options?: FindElementOptions
  ): Promise<ElementHandle>;

  select(
    selector: Selector,
    value: string | null,
    options?: FindElementOptions
  ): Promise<ElementHandle>;

  type(
    selector: Selector,
    value: string | null,
    options?: FindElementOptions & TypeOptions
  ): Promise<ElementHandle>;

  // reference for internal use
  qawolf: QAWolfBrowserContext;

  // reference to original PlaywrightBrowser.close method
  _close(): Promise<void>;
}
