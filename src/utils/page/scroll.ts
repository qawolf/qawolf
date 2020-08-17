import { ElementHandle, Page } from 'playwright';

export interface ScrollValue {
  x: number;
  y: number;
}

export interface ScrollOptions extends ScrollValue {
  timeout?: number;
}

export const DEFAULT_TIMEOUT = 30000; // milliseconds

export const getScrollValue = (
  page: Page,
  elementHandle: ElementHandle<Element>,
): Promise<ScrollValue> => {
  return page.evaluate((element) => {
    return { x: element.scrollLeft, y: element.scrollTop };
  }, elementHandle);
};

export const scroll = async (
  page: Page,
  selector: string,
  { timeout, x, y }: ScrollOptions,
): Promise<void> => {
  const elementHandle = await page.waitForSelector(selector);
  const startScrollValue = await getScrollValue(page, elementHandle);

  try {
    await page.waitForFunction(
      ({ element, x, y }): boolean => {
        element.scroll(x, y);
        return element.scrollLeft === x && element.scrollTop === y;
      },
      { element: elementHandle, x, y },
      { polling: 100, timeout: timeout || DEFAULT_TIMEOUT },
    );
  } catch (error) {
    const endScrollValue = await getScrollValue(page, elementHandle);
    if (
      startScrollValue.x !== endScrollValue.x ||
      startScrollValue.y !== endScrollValue.y
    ) {
      // were able to scroll at least somewhat, don't throw error
      return;
    }

    throw new Error(`could not scroll element ${selector}`);
  }
};
