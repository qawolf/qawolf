import { ElementEvent, TextOperation } from "../types";
import {
  buildEventCode,
  insertEvent,
  PatchEventOptions,
  prepareSourceVariables,
} from "./insertEvent";
import { ActionExpression } from "./parseCode";

export const patchCheckOrUncheck = (
  options: PatchEventOptions
): TextOperation[] => {
  const { initializeCode, variable } = prepareSourceVariables(options);
  if (initializeCode) return insertEvent(options);

  const { code, expressions, event } = options;

  const lastExpression = expressions[expressions.length - 1];

  const isMatch = (expression: ActionExpression) =>
    expression.method === "click" &&
    expression.variable === variable &&
    expression.args[0]?.text === (event as ElementEvent).relatedClickSelector

  if (lastExpression && isMatch(lastExpression)) {
    const eventCode = buildEventCode(options.event, variable);
    
    let index = lastExpression.statement.pos;
    while (code[index] === "\n" || code[index] === " ") {
      // Don't delete the initial line break or indentation
      index += 1;
    }

    return [
      // Delete click line that caused check/uncheck
      {
        type: "delete",
        index,
        length: lastExpression.statement.end - index,
      },
      // Add check/uncheck line
      {
        type: "insert",
        index,
        value: eventCode,
      },
    ];
  }

  return insertEvent(options);
};
