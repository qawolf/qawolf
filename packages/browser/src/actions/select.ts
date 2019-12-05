import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { isNil, QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";

export const selectElement = async (
  elementHandle: ElementHandle,
  value: string | null,
  timeoutMs?: number
): Promise<void> => {
  logger.verbose("selectElement");
  const findTimeoutMs = (isNil(timeoutMs) ? CONFIG.findTimeoutMs : timeoutMs)!;

  // ensure option with desired value is loaded before selecting
  await elementHandle.evaluate(
    (element: HTMLSelectElement, value: string | null, timeoutMs: number) => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.select.waitForOption(element, value, timeoutMs);
    },
    value,
    findTimeoutMs
  );

  await elementHandle.select(value || "");
};
