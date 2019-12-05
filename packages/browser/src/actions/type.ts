import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { Selector } from "@qawolf/types";
import { sleep } from "@qawolf/web";
import { Page, ElementHandle } from "puppeteer";
import { clearElement } from "./clear";
import { find, FindOptionsBrowser } from "../find";
import { retryExecutionError } from "../retry";
import { valueToStrokes } from "../strokes";
import { getPage } from "../getPage";

export const typeElement = async (
  page: Page,
  element: ElementHandle,
  value: string | null
): Promise<void> => {
  logger.verbose("typeElement");

  // focus and clear the element
  await clearElement(element);

  if (!value) return;

  // logging the keyboard codes below will leak secrets
  // which is why we have it hidden behind the DEBUG flag
  // since we default logs to VERBOSE
  for (const stroke of valueToStrokes(value)) {
    if (stroke.type === "↓") {
      logger.debug(`keyboard.down("${stroke.value}")`);
      await page.keyboard.down(stroke.value);
    } else if (stroke.type === "↑") {
      logger.debug(`keyboard.up("${stroke.value}")`);
      await page.keyboard.up(stroke.value);
    } else if (stroke.type === "→") {
      logger.debug(`keyboard.sendCharacter("${stroke.value}")`);
      await page.keyboard.sendCharacter(stroke.value);
    }

    await sleep(CONFIG.keyDelayMs);
  }
};

export const type = async (
  selector: Selector,
  value: string | null,
  options: FindOptionsBrowser
) => {
  logger.verbose("type");

  const page = await getPage({
    ...options,
    pageIndex: selector.page
  });

  await retryExecutionError(async () => {
    const element = await find(
      { ...selector, action: "type" },
      { ...options, page }
    );
    await typeElement(page.super, element, value);
  });
};
