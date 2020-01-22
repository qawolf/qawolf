import { CONFIG } from "@qawolf/config";
import { browserLogger } from "@qawolf/logger";
import { launch } from "../../src";

it("captures browser logs", async () => {
  const browser = await launch({ url: `${CONFIG.testUrl}login` });
  const page = await browser.page();

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

  await page.evaluate(() => {
    const button = document.getElementsByTagName("button")[0]!;
    console.debug("click on", button);
  });

  // check it formats nodes by their xpath
  expect(lastMessage).toEqual({
    level: "debug",
    message: `click on //*[@id='login']/button`
  });

  await browser.close();
});

it("logs qawolf debug logs when QAW_LOG_LEVEL is debug", async () => {
  const browser = await launch({
    logLevel: "debug",
    url: CONFIG.testUrl
  });
  const page = await browser.page();

  let lastMessage: any | false = false;

  browserLogger.onLog(
    (level: string, message: string) => (lastMessage = { level, message })
  );

  await page.evaluate(() => {
    console.debug("some log");
    console.debug("qawolf: some log");
  });

  expect(lastMessage).toEqual({
    level: "debug",
    message: `qawolf: some log`
  });

  await browser.close();
});

it("ignores qawolf debug logs when QAW_LOG_LEVEL is not debug", async () => {
  const browser = await launch({
    logLevel: "verbose",
    url: `${CONFIG.testUrl}login`
  });
  const page = await browser.page();

  let lastMessage: any | false = false;

  browserLogger.onLog(
    (level: string, message: string) => (lastMessage = { level, message })
  );

  await page.evaluate(() => {
    console.debug("qawolf: some log");
    console.debug("some log");
  });

  expect(lastMessage).toEqual({
    level: "debug",
    message: `some log`
  });

  await browser.close();
});
