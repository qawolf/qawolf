import { logger } from "@qawolf/logger";
import { FindOptions } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";

export const selectElement = async (
  elementHandle: ElementHandle,
  value: string | null,
  options: FindOptions = {}
): Promise<void> => {
  logger.verbose("selectElement: waitForOption");

  // ensure option with desired value is loaded before selecting
  await elementHandle.evaluate(
    (element: HTMLSelectElement, value: string | null, timeoutMs: number) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.select.waitForOption(element, value, timeoutMs);
    },
    value,
    options.timeoutMs || 0
  );

  logger.verbose("selectElement: element.select");
  await elementHandle.select(value || "");
};
