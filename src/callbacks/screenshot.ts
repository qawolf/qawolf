import { BrowserRunner } from "../BrowserRunner";
import { Callback } from "../Runner";
import { sleep } from "../utils";

export const buildScreenshotCallback = (sleepMs?: number): Callback => {
  return async (runner: BrowserRunner) => {
    if (sleepMs) await sleep(sleepMs);

    await runner._browser._browser!.saveScreenshot(`./tmp/${Date.now()}.png`);
  };
};
