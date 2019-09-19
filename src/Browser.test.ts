import Browser from "./Browser";
import { QAWolfWindow } from "./types";

let browser: Browser;

beforeAll(async () => {
  browser = new Browser();
  // "The Internet" https://github.com/tourdedave/the-internet
  await browser.launch();
  await browser._browser!.url("http://localhost:5000");
});

afterAll(() => browser.close());

test("Browser launches the internet", async () => {
  const element = await browser._browser!.$(".heading");
  const text = await element.getText();
  expect(text).toBe("Welcome to the-internet");
});

test("Browser injects sdk", async () => {
  await browser.injectSdk();

  const isLoaded = await browser._browser!.execute(
    () => !!(window as QAWolfWindow).qawolf
  );
  expect(isLoaded).toBeTruthy();
});
