import { Page } from "puppeteer";
import { Browser } from "../browser/Browser";
import { CONFIG } from "../config";
import { QAWolf } from "./index";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
  page = await browser.currentPage();
});

afterAll(() => browser.close());
