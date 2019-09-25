import fs from "fs-extra";
import puppeteer from "puppeteer";
import { logger } from "../logger";

const webBundle = fs.readFileSync("build/qawolf.web.js", "utf8");

export const createPage = async (url?: string) => {
  logger.debug("create Browser");

  const browser = await puppeteer.launch({
    // needed for circleci
    args: ["–no-sandbox", "--disable-setuid-sandbox"],
    headless: false
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(webBundle);

  if (url) {
    await page.goto(url);
  }

  return page;
};
