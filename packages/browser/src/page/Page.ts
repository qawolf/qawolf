import { Page as PuppeteerPage } from "puppeteer";
import { InternalPage } from "./InternalPage";

// PuppeteerPage decorated with .qawolf: Page
export interface Page extends PuppeteerPage {
  qawolf: InternalPage;
}
