import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { BrowserRunner } from "../browser/BrowserRunner";
import { Callback } from "../Runner";
import { CONFIG } from "../config";
import { sleep } from "../utils";

export const buildScreenshotCallback = (sleepMs?: number): Callback => {
  if (!CONFIG.screenshotPath) throw new Error("Must set SCREENSHOT_PATH");

  return async (runner: BrowserRunner) => {
    if (sleepMs) await sleep(sleepMs);

    const path = resolve(CONFIG.screenshotPath!);
    await ensureDir(path);

    const page = await runner.browser.currentPage();
    await page.screenshot({ path: `${path}/${Date.now()}.png` });
  };
};
