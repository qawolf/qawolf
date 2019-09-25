import { createPage } from "./browser";
import { CONFIG } from "../config";
import { QAWolf } from "../web";

test("createPage injects qawolf", async () => {
  const page = await createPage(CONFIG.testUrl);

  const isLoaded = await page.evaluate(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return !!qawolf;
  });

  expect(isLoaded).toBeTruthy();

  await page.browser().close();
});
