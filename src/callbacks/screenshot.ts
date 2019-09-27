import { BrowserRunner } from "../browser/BrowserRunner";
import { Callback } from "../Runner";
import { sleep } from "../utils";

export const buildScreenshotCallback = (sleepMs?: number): Callback => {
  return async (runner: BrowserRunner) => {
    if (sleepMs) await sleep(sleepMs);

    const page = await runner.browser.currentPage();
    await page.screenshot({ path: `./tmp/${Date.now()}.png` });
  };
};
