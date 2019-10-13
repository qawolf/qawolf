import { ElementHandle, Page, Serializable } from "puppeteer";
import { CONFIG } from "../config";
import { logger } from "../logger";
import { retryAsync } from "./pageUtils";
import { BrowserStep } from "../types";
import { QAWolf } from "../web";

export const findElementForStep = async (
  page: Page,
  step: BrowserStep
): Promise<ElementHandle> => {
  const jsHandle = await page.evaluateHandle(
    waitForArgs => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.locate.waitForElement(waitForArgs);
    },
    {
      action: step.action,
      dataAttribute: CONFIG.dataAttribute,
      target: step.target,
      value: step.value,
      timeoutMs: 30000
    } as Serializable
  );

  const handle = jsHandle.asElement();
  if (!handle) {
    throw new Error(`No element handle found for step ${step}`);
  }

  return handle;
};

export const inputStep = async (
  page: Page,
  elementHandle: ElementHandle,
  step: BrowserStep
): Promise<void> => {
  const handleProperty = await elementHandle.getProperty("tagName");
  const tagName = await handleProperty.jsonValue();
  const value = step.value || "";

  if (tagName.toLowerCase() === "select") {
    await elementHandle.select(value);
  } else {
    // clear current value
    await page.evaluate(element => {
      element.value = "";
    }, elementHandle);

    await elementHandle.type(value);
  }
};

export const scrollStep = async (
  page: Page,
  step: BrowserStep
): Promise<void> => {
  await page.evaluate(
    step => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.actions.scrollTo(step.scrollTo!);
    },
    step as Serializable
  );
};

export const runStep = async (page: Page, step: BrowserStep): Promise<void> => {
  logger.debug(`running step: ${JSON.stringify(step)}`);

  return await retryAsync(async () => {
    if (step.action === "scroll") {
      return scrollStep(page, step);
    }

    const elementHandle = await findElementForStep(page, step);
    if (step.action === "click") {
      return elementHandle.click();
    }

    if (step.action === "input") {
      return inputStep(page, elementHandle, step);
    }

    throw new Error(`step action not supported: ${step.action}`);
  });
};
