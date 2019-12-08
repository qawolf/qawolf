import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { focusClearElement } from "./focusClearElement";
import { valueToStrokes } from "../strokes";

export const typeElement = async (
  page: PuppeteerPage,
  element: ElementHandle,
  value: string | null
): Promise<void> => {
  logger.verbose("typeElement");

  await focusClearElement(element);

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
