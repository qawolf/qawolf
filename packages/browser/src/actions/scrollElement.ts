import { logger } from "@qawolf/logger";
import { ScrollValue, FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";

export const scrollElement = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  options: FindOptions = {}
): Promise<void> => {
  logger.verbose("scrollElement");

  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scroll(element, value, timeoutMs);
    },
    value,
    options.timeoutMs || 0
  );
};
