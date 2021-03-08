import { ElementEvent } from "../types";
import { ActionExpression } from "./parseCode";
import {
  findSourceVariables,
  patchEvent,
  PatchEventOptions,
} from "./patchEvent";

export const findSelectOptionExpression = (
  options: PatchEventOptions
): ActionExpression | null => {
  const { initializeCode, variable } = findSourceVariables(options);
  if (initializeCode) return null;

  const { expressions, event } = options;

  const lastExpression = expressions[expressions.length - 1];

  const isMatch = (expression: ActionExpression | null) =>
    expression &&
    expression.method === "selectOption" &&
    expression.variable === variable &&
    expression.args[0]?.text === (event as ElementEvent).selector;

  if (isMatch(lastExpression)) return lastExpression;

  return null;
};

export const updateSelectOption = (
  code: string,
  fill: ActionExpression,
  value: string
): string => {
  const valueArg = fill.args[1];
  const valueLength = valueArg.text?.length || 0;

  // -2 for value quotes
  const beforeArg = code.substring(0, valueArg.end - valueLength - 2);
  const updatedArg = JSON.stringify(value);
  const afterArg = code.substring(valueArg.end);

  return beforeArg + updatedArg + afterArg;
};

export const patchSelectOption = (
  options: PatchEventOptions
): string | null => {
  // update the matching fill if we find one
  const matchingAction = findSelectOptionExpression(options);

  if (matchingAction) {
    const { code, event } = options;
    return updateSelectOption(code, matchingAction, event.value || "");
  }

  return patchEvent(options);
};
