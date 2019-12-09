import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";
import { getFindOptions } from "../find/getFindOptions";

export const selectElement = async (
  elementHandle: ElementHandle,
  value: string | null,
  options: FindOptions = {}
): Promise<void> => {
  const findOptions = getFindOptions(options);

  logger.verbose(
    `selectElement: waitForOption ${value} ${JSON.stringify(findOptions)}`
  );

  // ensure option with desired value is loaded before selecting
  await elementHandle.evaluate(
    (element: HTMLSelectElement, value: string | null, timeoutMs: number) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.select.waitForOption(element, value, timeoutMs);
    },
    value,
    findOptions.timeoutMs || 0
  );

  logger.verbose("selectElement: element.select");
  await elementHandle.select(value || "");
};
