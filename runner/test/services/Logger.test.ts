// must be called before anything is imported so it happens before debug is imported
// we expect this to be set in the Dockerfile
process.env.DEBUG = "pw:api";

import { launch } from "../../src/environment/launch";
import { Logger } from "../../src/services/Logger";

describe("Logger", () => {
  const logger = new Logger();

  beforeEach(() => {
    logger._logs = [];
  });

  describe("log", () => {
    it("stores an error log", () => {
      logger.log("name", "error", new Error("demogorgon"));

      expect(logger.logs).toEqual([
        {
          message: "demogorgon",
          severity: "error",
          timestamp: expect.any(String),
        },
      ]);
    });

    it("stores an info log", () => {
      logger.log("name", "info", "eleven");

      expect(logger.logs).toEqual([
        {
          message: "eleven",
          severity: "info",
          timestamp: expect.any(String),
        },
      ]);
    });
  });

  it("captures pw:api logs", async () => {
    const { browser } = await launch({ headless: true });
    await browser.close();

    expect(logger.logs[0]).toMatchObject({
      message: "pw:api => browserType.launch started",
    });
  });
});
