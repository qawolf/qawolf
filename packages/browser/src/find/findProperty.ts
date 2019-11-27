import { CONFIG } from "@qawolf/config";
import { isNil, waitFor } from "@qawolf/web";
import { Page } from "puppeteer";
import { retryExecutionError } from "../retry";

export type FindPropertyArgs = {
  property: string;
  selector: string;
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
