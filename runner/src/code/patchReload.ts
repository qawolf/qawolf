import {
  findSourceVariables,
  patchEvent,
  PatchEventOptions,
} from "./patchEvent";

export const patchReload = (options: PatchEventOptions): string | null => {
  const { expressions } = options;
  // skip the reload if the last expression is a reload
  const { variable } = findSourceVariables(options);

  const lastExpression = expressions[expressions.length - 1];

  const shouldSkip =
    lastExpression?.method === "reload" &&
    lastExpression?.variable === variable;

  if (shouldSkip) return null;

  return patchEvent(options);
};
