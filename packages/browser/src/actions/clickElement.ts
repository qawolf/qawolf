import { logger } from "@qawolf/logger";
import { ElementHandle } from "playwright";

export type ClickOptions = {
  simulate?: boolean;
};

export const clickElement = async (
  elementHandle: ElementHandle,
  options: ClickOptions = {}
): Promise<void> => {
  logger.verbose(`clickElement: received ${JSON.stringify(options)}`);

  // ElementHandle.click scrolls an element into view, finds it's coordinates, and clicks on that point.
  // There are corner cases like custom scrolling where it will break.
  // https://github.com/puppeteer/puppeteer/issues/2190#issuecomment-380254352
  // We ran into unexplainable issues with clients where it would hang, but simulating a click works fine.
  // https://github.com/puppeteer/puppeteer/issues/3347
  // Since simulating the click is simpler and works more often, we default to it.
  // However we expose ElementHandle.click behind an option, simulate=false, in case it is needed.
  // For example, we use simulate=false for the Recorder test since we need a trusted click event.
  if (options.simulate === false) {
    await elementHandle.evaluate(element =>
      console.log("qawolf: click", element)
    );
    await elementHandle.click();
  } else {
    await elementHandle.evaluate((element: HTMLElement) => {
      console.log("qawolf: click", element);
      const clickEvent = new MouseEvent("click", { bubbles: true });
      element.dispatchEvent(clickEvent);
    });
  }

  logger.verbose("clickElement: clicked");
};
