import { TextOperation, WindowEvent } from "../types";
import { selectAwaitChildExpression } from "./parseCode";
import { patch } from "./patch";
import { PatchEventOptions, prepareSourceVariables } from "./patchEvent";

export const patchPopup = (options: PatchEventOptions): TextOperation[] => {
  const { pageVariable } = prepareSourceVariables(options);

  const { code, event, expressions, variables } = options;

  const triggerExpression = expressions[expressions.length - 1];
  if (!triggerExpression) {
    // Could not find expression that triggered the popup
    return [];
  }

  // start at page2
  let index = 2;
  let popupVariable;
  do {
    popupVariable = `page${index}`;
    index += 1;
  } while (Object.keys(variables).includes(popupVariable));
  variables[popupVariable] = (event as WindowEvent).popup;

  const { statement } = triggerExpression;

  const triggerCode = selectAwaitChildExpression(code, statement);

  const popupPatch = [
    `const [${popupVariable}] = await Promise.all([`,
    `  ${pageVariable}.waitForEvent("popup"),`,
    `  ${triggerCode},`,
    `]);`,
    `await ${popupVariable}.waitForLoadState("domcontentloaded");`,
    `await ${popupVariable}.bringToFront();`,
  ].join("\n");

  const withoutTrigger =
    code.substring(0, statement.pos) + code.substring(statement.end);

  return patch(withoutTrigger, popupPatch);
};
