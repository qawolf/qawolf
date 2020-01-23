import { logger } from "@qawolf/logger";
import { FindElementOptions, Selector } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { findElement } from "./findElement";
import { getFindElementOptions } from "./getFindElementOptions";

export const find = async (
  page: PuppeteerPage,
  selector: Selector,
  options: FindElementOptions = {}
): Promise<ElementHandle> => {
  const findOptions = getFindElementOptions(options);
  logger.verbose(
    `find: ${JSON.stringify(selector)} ${JSON.stringify(findOptions)}`
  );

  let element = await findElement(page, selector, {
    ...findOptions,
    log: true
  });

  if (findOptions.sleepMs) {
    logger.verbose(`find: found element, sleeping ${findOptions.sleepMs}ms`);
    await sleep(findOptions.sleepMs);

    // reload the element in case it changed since the sleep
    try {
      // try to find it immediately
      logger.verbose(`find: find element after sleep (timeoutMs: 0)`);
      element = await findElement(page, selector, {
        ...findOptions,
        timeoutMs: 0
      });
    } catch (e) {
      // if it cannot be found immediately wait longer
      logger.verbose(
        `find: element not found immediately, try slower ${JSON.stringify(
          findOptions
        )}`
      );
      element = await findElement(page, selector, findOptions);
    }
  }

  return element;
};
