import { Browser } from "./Browser";
import { CONFIG } from "../config";
import { QAWolf } from "../web";

test("Browser.create injects qawolf", async () => {
  const browser = await Browser.create(CONFIG.testUrl);

  const page = await browser.page();

  const isLoaded = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return !!qawolf;
  });

  expect(isLoaded).toBeTruthy();
  await browser.close();
});
