import { ElementEvent, TextOperation, WindowEvent } from "../types";
import { formatArgument } from "./formatArgument";
import { insertBeforeHandle } from "./patchUtils";
import { PrepareSourceVariables,prepareSourceVariables } from './prepareSourceVariables';

export type PatchEventOptions = PrepareSourceVariables & {
  code: string;
  event: ElementEvent | WindowEvent
};

export const buildEventCode = (
  event: ElementEvent | WindowEvent,
  variable: string
): string => {
  const args: string[] = [];

  const selector = (event as ElementEvent).selector;
  if (selector !== undefined && event.action !== "keyboard.press") {
    args.push(formatArgument(selector));
  }

  if (event.value !== undefined) {
    args.push(formatArgument(event.value));
  }

  const line = `await ${variable}.${event.action}(${args.join(", ")});`;
  return line;
};

export const insertEvent = (options: PatchEventOptions): TextOperation[] => {
  const { event } = options;
  const { initializeCode, variable } = prepareSourceVariables({
    ...options,
    shouldBringPageToFront: event.action !== "goto",
    // we will patch the initialize code so we want to declare the variable
    // to prevent it from needing reinitialization on future events
    shouldDeclarePageVariable: event.action === "goto",
    declare: true,
  });

  const eventCode = buildEventCode(event, variable);
  return insertBeforeHandle(options.code, `${initializeCode}${eventCode}\n`);
};
