import { Variables, WindowEvent } from "../types";
import { ActionExpression, selectAwaitChildExpression } from "./parseCode";
import { patch, PATCH_HANDLE } from "./patch";
import { findSourceVariables } from "./patchEvent";

export type PatchPopupOptions = {
  code: string;
  event: WindowEvent;
  expressions: (ActionExpression | null)[];
  variables: Variables;
};

export const patchPopup = (options: PatchPopupOptions): string | null => {
  const { pageVariable } = findSourceVariables(options);

  const { code, event, expressions, variables } = options;

  const triggerExpression = expressions[expressions.length - 1];
  if (!triggerExpression) {
    // Could not find expression that triggered the popup
    return null;
  }

  // start at page2
  let index = 2;
  let popupVariable;
  do {
    popupVariable = `page${index}`;
    index += 1;
  } while (Object.keys(variables).includes(popupVariable));
  variables[popupVariable] = event.popup;

  const { statement } = triggerExpression;

  const triggerCode = selectAwaitChildExpression(code, statement);

  const popupPatch = [
    `const [${popupVariable}] = await Promise.all([`,
    `  ${pageVariable}.waitForEvent("popup"),`,
    `  ${triggerCode},`,
    `]);`,
    `await ${popupVariable}.waitForLoadState("domcontentloaded");`,
    `await ${popupVariable}.bringToFront();`,
    PATCH_HANDLE,
  ].join("\n");

  const withoutTrigger =
    code.substring(0, statement.pos) + code.substring(statement.end);

  return patch(withoutTrigger, popupPatch);
};
