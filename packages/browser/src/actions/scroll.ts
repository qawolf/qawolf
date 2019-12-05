import { logger } from "@qawolf/logger";
import { ScrollValue, Selector, FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";
import { find, FindOptionsBrowser } from "../find";
import { retryExecutionError } from "../retry";

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

export const scroll = async (
  selector: Selector,
  value: ScrollValue,
  options: FindOptionsBrowser
) => {
  logger.verbose("scroll");

  await retryExecutionError(async () => {
    const element = await find({ ...selector, action: "scroll" }, options);
    await scrollElement(element, value, options);
  });
};
