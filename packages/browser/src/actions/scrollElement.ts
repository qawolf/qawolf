import { logger } from "@qawolf/logger";
import { ScrollValue, FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";
import { getFindOptions } from "../find/getFindOptions";

export const scrollElement = async (
  elementHandle: ElementHandle,
  value: ScrollValue,
  options: FindOptions = {}
): Promise<void> => {
  const findOptions = getFindOptions(options);

  logger.verbose(`scrollElement: ${value} ${JSON.stringify(findOptions)}`);

  await elementHandle.evaluate(
    (element, value, timeoutMs) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.scroll(element, value, timeoutMs);
    },
    value,
    findOptions.timeoutMs || 0
  );
};
