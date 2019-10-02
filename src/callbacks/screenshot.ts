import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { BrowserRunner } from "../browser/BrowserRunner";
import { Callback } from "../Runner";
import { sleep } from "../utils";

const screenshotPath = resolve("./tmp");

export const buildScreenshotCallback = (sleepMs?: number): Callback => {
  return async (runner: BrowserRunner) => {
    if (sleepMs) await sleep(sleepMs);

    await ensureDir(screenshotPath);

    const page = await runner.browser.currentPage();
    await page.screenshot({ path: `${screenshotPath}/${Date.now()}.png` });
  };
};
