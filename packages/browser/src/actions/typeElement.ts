import { logger } from "@qawolf/logger";
import { TypeOptions } from "@qawolf/types";
import { isNil, sleep } from "@qawolf/web";
import { ElementHandle, Page as PlaywrightPage } from "playwright";
import { selectElementContent } from "./selectElementContent";
import { deserializeStrokes } from "../keyboard";

export const typeElement = async (
  page: PlaywrightPage,
  elementHandle: ElementHandle,
  value: string | null,
  options: TypeOptions = {}
): Promise<void> => {
  logger.verbose("typeElement: focus");

  await elementHandle.evaluate(element => {
    console.log("qawolf: type into", element);
  });

  await elementHandle.focus();

  if (options.replace) {
    await selectElementContent(elementHandle);
  }

  // default value to backspace to clear if null or "" is passed
  const text = value || "↓Backspace↑Backspace";

  const strokes = deserializeStrokes(text);

  if (!strokes) {
    // type seems to work better than sendCharacters so use it when possible
    // https://github.com/microsoft/playwright/issues/1057
    await elementHandle.type(text);
    return;
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
      await page.keyboard.sendCharacters(stroke.value);
      await sleep(options.delayMs || 0);
    }
  }
};
