import { TextOperation } from "../types";
import {
  insertEvent,
  PatchEventOptions,
} from "./insertEvent";
import { prepareSourceVariables } from "./prepareSourceVariables";

export const patchReload = (options: PatchEventOptions): TextOperation[] => {
  const { expressions } = options;
  const { variable } = prepareSourceVariables({
    ...options,
    shouldBringPageToFront: true
  });

  const lastExpression = expressions[expressions.length - 1];

  // skip the reload if the last expression is a reload
  const shouldSkip =
    lastExpression?.method === "reload" &&
    lastExpression?.variable === variable;
  if (shouldSkip) return [];

  return insertEvent(options);
};
