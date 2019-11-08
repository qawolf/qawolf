import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { QAWolfWeb, waitFor } from "@qawolf/web";
import { Locator, Step } from "@qawolf/types";
import { ElementHandle, Page, Serializable } from "puppeteer";
import { retryExecutionError } from "./retry";

export type FindPropertyArgs = {
  property: string;
  selector: string;
};

export const findElement = async (
  page: Page,
  step: Step,
  timeoutMs?: number
): Promise<ElementHandle> => {
  logger.verbose(
    `findElement: ${JSON.stringify(step.target).substring(0, 100)}`
  );

  const jsHandle = await page.evaluateHandle(
    (locator: Locator) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findElement(locator);
    },
    {
      action: step.action,
      dataAttribute: CONFIG.dataAttribute,
      target: step.target,
      timeoutMs: timeoutMs || CONFIG.findTimeoutMs,
      value: step.value
    } as Serializable
  );

  const handle = jsHandle.asElement();
  if (!handle) {
    throw new Error(`No element handle found for step ${step}`);
  }

  return handle;
};

export const findProperty = async (
  page: Page,
  { property, selector }: FindPropertyArgs,
  timeoutMs?: number
): Promise<string | null | undefined> => {
  const waitForTimeoutMs = timeoutMs || CONFIG.findTimeoutMs;

  const result = await retryExecutionError(async () => {
    const elementHandle = await waitFor(
      async () => {
        const elementHandles = await page.$$(selector);
        // either no element found or too many matching elements found
        if (elementHandles.length !== 1) return null;

        return elementHandles[0];
      },
      waitForTimeoutMs,
      100
    );
    if (!elementHandle) return null;

    const propertyHandle = await elementHandle.getProperty(property);
    const propertyValue = await propertyHandle.jsonValue();

    return propertyValue;
  });

  return result;
};

export const hasText = async (
  page: Page,
  text: string,
  timeoutMs?: number
): Promise<boolean> => {
  const waitForTimeoutMs = timeoutMs || CONFIG.findTimeoutMs;

  const result = await retryExecutionError(async () => {
    const pageHasText = await page.evaluate(
      ({ text, timeoutMs }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        return qawolf.find.hasText(text, timeoutMs);
      },
      { text, timeoutMs: waitForTimeoutMs }
    );

    return pageHasText;
  });

  return result;
};
