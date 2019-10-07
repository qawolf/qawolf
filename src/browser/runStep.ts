import { ElementHandle, Page, Serializable } from "puppeteer";
import { retryAsync } from "./pageUtils";
import { BrowserStep } from "../types";
import { QAWolf } from "../web";

export const findElementHandleForStep = async (
  page: Page,
  step: BrowserStep
): Promise<ElementHandle> => {
  const jsHandle = await page.evaluateHandle(
    step => {
      const qawolf: QAWolf = (window as any).qawolf;
      return qawolf.rank.waitForElement(step);
    },
    step as Serializable
  );

  const elementHandle = jsHandle.asElement();
  if (!elementHandle) {
    throw new Error(`No element handle found for step ${step}`);
  }

  return elementHandle;
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

export const typeStep = async (
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

export const runStep = async (page: Page, step: BrowserStep): Promise<void> => {
  return await retryAsync(async () => {
    if (step.action === "scroll") {
      return scrollStep(page, step);
    }

    const elementHandle = await findElementHandleForStep(page, step);
    if (step.action === "click") {
      return elementHandle.click();
    }

    if (step.action === "type") {
      return typeStep(page, elementHandle, step);
    }

    throw new Error(`step action not supported: ${step.action}`);
  });
};
