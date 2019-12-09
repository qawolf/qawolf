import { Page as PuppeteerPage } from "puppeteer";
import { QAWolfPage } from "./QAWolfPage";

// PuppeteerPage decorated with qawolf Page
export interface Page extends PuppeteerPage {
  qawolf: QAWolfPage;
}
