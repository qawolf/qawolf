import { logger } from "@qawolf/logger";
import { Selector } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { ElementHandle } from "puppeteer";
import { find, FindOptionsBrowser } from "../find";
import { retryExecutionError } from "../retry";

export const selectElement = async (
  elementHandle: ElementHandle,
  value: string | null,
  options: FindOptionsBrowser = {}
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

export const select = async (
  selector: Selector,
  value: string | null,
  options: FindOptionsBrowser
) => {
  logger.verbose("select");

  await retryExecutionError(async () => {
    const element = await find({ ...selector, action: "select" }, options);
    await selectElement(element, value, options);
  });
};
