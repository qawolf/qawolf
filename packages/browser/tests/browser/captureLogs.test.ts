import { CONFIG } from "@qawolf/config";
import { browserLogger } from "@qawolf/logger";
import { Browser, launch, Page } from "../../src";

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ url: `${CONFIG.testUrl}login` });
  page = await browser.page();
});

afterAll(() => browser.close());

it("captures browser logs", async () => {
  let lastMessage: any | false = false;

  browserLogger.onLog(
    (level: string, message: string) => (lastMessage = { level, message })
  );

  await page.evaluate(() => {
    console.info("should capture browser logs");
  });

  expect(lastMessage).toEqual({
    level: "info",
    message: "should capture browser logs"
  });
});

it("logs nodes as their xpath", async () => {
  let lastMessage: any | false = false;

  browserLogger.onLog(
    (level: string, message: string) => (lastMessage = { level, message })
  );

  await page.evaluate(() => {
    const button = document.getElementsByTagName("button")[0]!;
    console.debug("click on", button);
  });

  expect(lastMessage).toEqual({
    level: "debug",
    message: `click on //*[@id='login']/button`
  });
});
