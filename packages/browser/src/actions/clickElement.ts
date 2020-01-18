import { logger } from "@qawolf/logger";
import { ElementHandle } from "puppeteer";

export const clickElement = async (element: ElementHandle): Promise<void> => {
  logger.verbose("clickElement: received");
  await element.evaluate(e => (e as HTMLElement).click());
  logger.verbose("clickElement: clicked");
};
