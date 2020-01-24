import { Page as PlaywrightPage } from "playwright";
import { QAWolfPage } from "./QAWolfPage";

// PlaywrightPage decorated with qawolf Page
export interface Page extends PlaywrightPage {
  qawolf: QAWolfPage;
}
