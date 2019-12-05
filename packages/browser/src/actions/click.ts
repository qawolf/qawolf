import { logger } from "@qawolf/logger";
import { Selector } from "@qawolf/types";
import { ElementHandle } from "puppeteer";
import { find, FindOptionsBrowser } from "../find";
import { retryExecutionError } from "../retry";

export const clickElement = async (element: ElementHandle): Promise<void> => {
  logger.verbose("clickElement");

  await element.click();
};

export const click = async (
  selector: Selector,
  options: FindOptionsBrowser
) => {
  logger.verbose("click");

  await retryExecutionError(async () => {
    const element = await find({ ...selector, action: "click" }, options);

    await clickElement(element);
  });
};
