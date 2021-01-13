import { ElementEvent, Variables } from "../types";
import { ActionExpression } from "./parseCode";
import { findSourceVariables, patchEvent } from "./patchEvent";

export type FindFillOptions = {
  event: ElementEvent;
  expressions: (ActionExpression | null)[];
  variables: Variables;
};

export type PatchFillOptions = FindFillOptions & {
  code: string;
};

export const findFillExpression = (
  options: FindFillOptions
): ActionExpression | null => {
  const { initializeCode, variable } = findSourceVariables(options);
  if (initializeCode) return null;

  const { expressions, event } = options;

  const [secondToLastExpression, lastExpression] = [
    expressions[expressions.length - 2],
    expressions[expressions.length - 1],
  ];

  const isMatch = (expression: ActionExpression | null) =>
    expression &&
    expression.method === "fill" &&
    expression.variable === variable &&
    expression.args[0]?.text === event.selector &&
    expression.args[1]?.text !== undefined;

  if (isMatch(lastExpression)) return lastExpression;

  // match the second to last fill if it
  // precedes a press on the same variable
  if (
    lastExpression?.method === "press" &&
    lastExpression?.variable === variable &&
    isMatch(secondToLastExpression)
  )
    return secondToLastExpression;

  return null;
};

export const updateFill = (
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

export const patchFill = (options: PatchFillOptions): string | null => {
  // update the matching fill if we find one
  const matchingFill = findFillExpression(options);

  if (matchingFill) {
    const { code, event } = options;
    return updateFill(code, matchingFill, event.value || "");
  }

  return patchEvent(options);
};
