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

  if (options.simulate) {
    // We provide options.simulate as a workaround for when Playwright click does not work.
    // ElementHandle.click scrolls an element into view, finds it's coordinates, and clicks on that point.
    // There are corner cases like custom scrolling where it will break.
    // https://github.com/puppeteer/puppeteer/issues/2190#issuecomment-380254352
    // We ran into unexplainable issues with clients where it would hang, but simulating a click works fine.
    // https://github.com/puppeteer/puppeteer/issues/3347
    // However we default to the original Playwright click since there are also scenarios
    // where simulating a click does not work (ex. Material-UI Dropdown).
    // This also keeps our API closer to the Playwright API.
    await elementHandle.evaluate((element: HTMLElement) => {
      console.log("qawolf: click", element);
      const clickEvent = new MouseEvent("click", { bubbles: true });
      element.dispatchEvent(clickEvent);
    });
  } else {
    await elementHandle.evaluate(element =>
      console.log("qawolf: click", element)
    );
    await elementHandle.click();
  }

  logger.verbose("clickElement: clicked");
};
