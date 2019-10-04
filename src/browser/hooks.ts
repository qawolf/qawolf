import { ensureDir } from "fs-extra";
import { resolve } from "path";
import { Browser } from "./Browser";
import { CONFIG } from "../config";
import { sleep } from "../utils";

export const screenshot = async (browser: Browser) => {
  if (!CONFIG.screenshotPath) return;

  await sleep(1000);

  const path = resolve(CONFIG.screenshotPath!);
  await ensureDir(path);

  const page = await browser.currentPage();
  await page.screenshot({ path: `${path}/${Date.now()}.png` });
};

export const beforeEach = async (browser: Browser) => {
  await screenshot(browser);
};
