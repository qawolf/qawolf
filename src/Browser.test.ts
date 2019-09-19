import Browser from "./Browser";
import { CONFIG } from "./config";
import { QAWolf } from "./types";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  // "The Internet" https://github.com/tourdedave/the-internet
  await browser.launch();
  await browser._browser!.url(CONFIG.testUrl);
});

afterAll(() => browser.close());

test("Browser launches the internet", async () => {
  const element = await browser._browser!.$(".heading");
  const text = await element.getText();
  expect(text).toBe("Welcome to the-internet");
});

test("Browser injects sdk", async () => {
  await browser.injectSdk();

  const isLoaded = await browser._browser!.execute(() => {
    const qawolf: QAWolf = (window as any).qawolf;
    return !!qawolf;
  });

  expect(isLoaded).toBeTruthy();
});
