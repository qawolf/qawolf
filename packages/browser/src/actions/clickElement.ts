import { logger } from "@qawolf/logger";
import { ElementHandle } from "puppeteer";

export type ClickOptions = {
  simulate?: boolean;
};

export const clickElement = async (
  element: ElementHandle,
  options: ClickOptions = {}
): Promise<void> => {
  logger.verbose(`clickElement: received ${JSON.stringify(options)}`);

  if (options.simulate === false) {
    await element.click();
  } else {
    await element.evaluate(e => (e as HTMLElement).click());
  }

  logger.verbose("clickElement: clicked");
};
