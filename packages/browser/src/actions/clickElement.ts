import { logger } from "@qawolf/logger";
import { ElementHandle } from "puppeteer";

export const clickElement = async (element: ElementHandle): Promise<void> => {
  logger.verbose("clickElement: received");
  await element.click();
  logger.verbose("clickElement: clicked");
};
