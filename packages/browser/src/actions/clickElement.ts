import { logger } from "@qawolf/logger";
import { ElementHandle } from "puppeteer";

export const clickElement = async (element: ElementHandle): Promise<void> => {
  logger.verbose("clickElement");

  await element.click();
};
