import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { focusClearElement } from "./focusClearElement";
import { deserializeStrokes } from "../keyboard";

export const typeElement = async (
  page: PuppeteerPage,
  element: ElementHandle,
  value: string | null
): Promise<void> => {
  logger.verbose("typeElement");

  if (!value) {
    await focusClearElement(element);
    return;
  }

  const strokes = deserializeStrokes(value);

  if (strokes[0].value === "Enter" || strokes[0].value === "Tab") {
    // do not clear the element if the first character is Enter or Tab
    await element.focus();
  } else {
    await focusClearElement(element);
  }

  // logging the keyboard codes below will leak secrets
  // which is why we have it hidden behind the DEBUG flag
  // since we default logs to VERBOSE
  for (const stroke of strokes) {
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
