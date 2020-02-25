// needed to test logging test start
import "@qawolf/jest-plugin";
import { browserLogger } from "@qawolf/logger";
import { waitFor, sleep } from "@qawolf/web";
import { isEqual } from "lodash";
import { launch, LaunchResult, PageManager } from "../../src";

describe("PageManager capture logs", () => {
  describe("logs", () => {
    let lastMessage: any | false = false;
    let launched: LaunchResult;
    let manager: PageManager;

    beforeAll(async () => {
      launched = await launch();

      manager = await PageManager.create({
        index: 0,
        logLevel: "debug",
        page: await launched.context.newPage()
      });

      browserLogger.onLog((level: string, message: string) => {
        lastMessage = { level, message };
      });
    });

    afterAll(() => launched.browser.close());

    it("formats elements by their xpath", async () => {
      await manager.page().evaluate(() => {
        const button = document.getElementsByTagName("button")[0]!;
        console.debug("click on", button);
      });

      await waitFor(
        () =>
          isEqual(lastMessage, {
            level: "debug",
            message: `click on //*[@id='login']/button`
          }),
        1000,
        50
      );
    });

    it("logs test start", async () => {
      await waitFor(
        () =>
          isEqual(lastMessage, {
            level: "log",
            message: "jest: logs test start"
          }),
        1000,
        50
      );
    });

    it("stringifies objects", async () => {
      await manager.page().evaluate(() => {
        console.debug("qawolf: my log", { hello: true });
      });
      await waitFor(
        () =>
          isEqual(lastMessage, {
            level: "debug",
            message: 'qawolf: my log {"hello":true}'
          }),
        1000,
        50
      );
    });
  });

  it("filters out qawolf debug logs when QAW_LOG_LEVEL != debug", async () => {
    const launched = await launch();

    const page = await launched.context.newPage();

    await PageManager.create({ index: 0, logLevel: "verbose", page });

    browserLogger.onLog((level: string, message: string) => {
      lastMessage = { level, message };
    });

    let lastMessage: any | false = false;
    browserLogger.onLog(
      (level: string, message: string) => (lastMessage = { level, message })
    );

    await page.evaluate(() => {
      console.debug("1");
      console.debug("qawolf: 2");
    });

    await sleep(1000);

    expect(lastMessage).toEqual({
      level: "debug",
      message: "1"
    });

    await launched.browser.close();
  });
});
