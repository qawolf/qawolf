import { logger } from "@qawolf/logger";
import { Page } from "playwright-core";

export const logTestStarted = (page: Page) => {
  /**
   * Log when a test starts in the browser to provide context.
   */
  const jasmine = (global as any).jasmine;
  if (!jasmine || !jasmine.qawolf) return;

  // TODO jest-playwright support?
  // hook provided by @qawolf/jest-plugin
  jasmine.qawolf.onTestStarted(async (name: string) => {
    try {
      if (page.isClosed()) return;

      await page.evaluate(
        (testName: string) => console.log(`jest: ${testName}`),
        name
      );
    } catch (e) {
      logger.debug(`could not log test started: ${e.toString()}`);
    }
  });
};
