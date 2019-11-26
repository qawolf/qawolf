import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { isNil, QAWolfWeb, waitFor } from "@qawolf/web";
import { Locator, Step } from "@qawolf/types";
import { ElementHandle, Page } from "puppeteer";
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
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  const jsHandle = await page.evaluateHandle(
    (locator: Locator) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.find.findElement(locator);
    },
    {
      action: step.action,
      dataAttribute: CONFIG.dataAttribute,
      target: step.target,
      timeoutMs: findTimeoutMs,
      value: step.value
    } as any
  );

  const handle = jsHandle.asElement();
  if (!handle) {
    throw new Error(`No element handle found for step ${step.index}`);
  }

  return handle;
};

export const findProperty = async (
  page: Page,
  { property, selector }: FindPropertyArgs,
  timeoutMs?: number
): Promise<string | null | undefined> => {
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  const result = await retryExecutionError(async () => {
    const elementHandle = await waitFor(
      async () => {
        const elementHandles = await page.$$(selector);
        // either no element found or too many matching elements found
        if (elementHandles.length !== 1) return null;

        return elementHandles[0];
      },
      findTimeoutMs,
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
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  const result = await retryExecutionError(async () => {
    const pageHasText = await page.evaluate(
      ({ text, timeoutMs }) => {
        const qawolf: QAWolfWeb = (window as any).qawolf;

        return qawolf.find.hasText(text, timeoutMs);
      },
      { text, timeoutMs: findTimeoutMs }
    );

    return pageHasText;
  });

  return result;
};
