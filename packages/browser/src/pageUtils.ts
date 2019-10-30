import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Locator, Step } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle, Page, Serializable } from "puppeteer";

export const findElement = async (
  page: Page,
  step: Step
): Promise<ElementHandle> => {
  logger.verbose(
    `findElement: ${JSON.stringify(step.target).substring(0, 100)}`
  );

  const jsHandle = await page.evaluateHandle(
    (locator: Locator) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.locate.waitForElement(locator);
    },
    {
      action: step.action,
      dataAttribute: CONFIG.dataAttribute,
      target: step.target,
      timeoutMs: CONFIG.findTimeoutMs,
      value: step.value
    } as Serializable
  );

  const handle = jsHandle.asElement();
  if (!handle) {
    throw new Error(`No element handle found for step ${step}`);
  }

  return handle;
};

export const retryExecutionError = async (
  func: () => Promise<any>,
  times: number = 3
): Promise<any> => {
  for (let i = 0; i < times; i++) {
    try {
      return await func();
    } catch (error) {
      if (
        (i < times - 1 &&
          error.message ===
            "Execution context was destroyed, most likely because of a navigation.") ||
        error.message ===
          "Protocol error (Runtime.callFunctionOn): Execution context was destroyed." ||
        error.message === "Node is detached from document"
      ) {
        logger.verbose(
          `retryExecutionError: retrying ${i + 1}/${times} error: "${
            error.message
          }"`
        );
        continue;
      }

      logger.error(
        `retryExecutionError: will not retry unknown error: "${error.message}"`
      );
      throw error;
    }
  }
};
