import { logger } from "@qawolf/logger";
import { TypeOptions } from "@qawolf/types";
import { isNil, sleep } from "@qawolf/web";
import { ElementHandle, Page as PuppeteerPage } from "puppeteer";
import { clearElement } from "./clearElement";
import { deserializeStrokes, Stroke } from "../keyboard";

const shouldClear = (strokes: Stroke[]) => {
  if (strokes.length < 1) return true;

  const value = strokes[0].value;
  return value !== "Enter" && value !== "Tab";
};

export const typeElement = async (
  page: PuppeteerPage,
  element: ElementHandle,
  value: string | null,
  options: TypeOptions = {}
): Promise<void> => {
  logger.verbose("typeElement: focus");
  await element.focus();

  const strokes = deserializeStrokes(value || "");

  if (!options.skipClear && shouldClear(strokes)) {
    await clearElement(element);
  }

  // logging the keyboard codes below will leak secrets
  // which is why we have it hidden behind the DEBUG flag
  // since we default logs to VERBOSE
  for (const stroke of strokes) {
    if (stroke.type === "↓") {
      logger.debug(`keyboard.down("${stroke.value}")`);
      await page.keyboard.down(stroke.value);
      await sleep(isNil(options.delayMs) ? 300 : 0);
    } else if (stroke.type === "↑") {
      logger.debug(`keyboard.up("${stroke.value}")`);
      await page.keyboard.up(stroke.value);
      await sleep(isNil(options.delayMs) ? 300 : 0);
    } else if (stroke.type === "→") {
      logger.debug(`keyboard.sendCharacter("${stroke.value}")`);
      await page.keyboard.sendCharacter(stroke.value);
      await sleep(options.delayMs || 0);
    }
  }
};
