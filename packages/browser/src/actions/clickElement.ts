import { logger } from "@qawolf/logger";
import { Selector } from "@qawolf/types";
import { ElementHandle } from "puppeteer";
export const clickElement = async (element: ElementHandle): Promise<void> => {
  logger.verbose("clickElement");

  await element.click();
};
