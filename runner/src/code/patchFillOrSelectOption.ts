import { ElementEvent } from "../types";
import { ActionExpression } from "./parseCode";
import {
  formatArgument,
  patchEvent,
  PatchEventOptions,
  prepareSourceVariables,
} from "./patchEvent";

export const findExpressionToUpdate = (
  options: PatchEventOptions
): ActionExpression | null => {
  const { initializeCode, variable } = prepareSourceVariables(options);
  if (initializeCode) return null;

  const { expressions, event } = options;

  const [secondToLastExpression, lastExpression] = [
    expressions[expressions.length - 2],
    expressions[expressions.length - 1],
  ];

  const isMatch = (expression: ActionExpression | null) =>
    expression &&
    expression.method === options.event.action &&
    expression.variable === variable &&
    expression.args[0]?.text === (event as ElementEvent).selector &&
    expression.args[1]?.text !== undefined;

  if (isMatch(lastExpression)) return lastExpression;

  // match the second to last action if it
  // precedes a press on the same variable
  if (
    lastExpression?.method === "press" &&
    lastExpression?.variable === variable &&
    isMatch(secondToLastExpression)
  )
    return secondToLastExpression;

  return null;
};

export const updateExpression = (
  code: string,
  expression: ActionExpression,
  value: string
): string => {
  const valueArg = expression.args[1];

  const beforeArg = code.substring(0, valueArg.pos);

  // match the same padding
  const [valuePadding] = code
    .substring(valueArg.pos, valueArg.end)
    .match(/(^\s*)/) || [" "];

  const updatedValue = formatArgument(value);

  const afterArg = code.substring(valueArg.end);

  return beforeArg + valuePadding + updatedValue + afterArg;
};

export const patchFillOrSelectOption = (
  options: PatchEventOptions
): string | null => {
  const matchingExpression = findExpressionToUpdate(options);
  if (matchingExpression) {
    return updateExpression(
      options.code,
      matchingExpression,
      options.event.value || ""
    );
  }

  return patchEvent(options);
};
