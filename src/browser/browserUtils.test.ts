import { createBrowser, injectClient } from "./browserUtils";
import { CONFIG } from "../config";
import { QAWolf } from "../web";

test('createBrowser launches "the internet"', async () => {
  const browser = await createBrowser(CONFIG.testUrl);
  const element = await browser!.$(".heading");

  const text = await element.getText();
  expect(text).toBe("Welcome to the-internet");
  await browser.closeWindow();
});

test("injectClient creates qawolf", async () => {
  const browser = await createBrowser();
  await injectClient(browser);

  const isLoaded = await browser.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return !!qawolf;
  });

  expect(isLoaded).toBeTruthy();
  await browser.closeWindow();
});
