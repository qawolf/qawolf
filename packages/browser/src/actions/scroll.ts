import { logger } from "@qawolf/logger";
import { ScrollValue } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";

export const scrollElement = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  timeoutMs: number = 10000
): Promise<void> => {
  logger.verbose("scrollElement");

  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scroll(element, value, timeoutMs);
    },
    value,
    timeoutMs
  );
};
