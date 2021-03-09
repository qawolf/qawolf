import {
  patchEvent,
  PatchEventOptions,
  prepareSourceVariables,
} from "./patchEvent";

export const patchReload = (options: PatchEventOptions): string | null => {
  const { expressions } = options;
  const { variable } = prepareSourceVariables(options);

  const lastExpression = expressions[expressions.length - 1];

  // skip the reload if the last expression is a reload
  const shouldSkip =
    lastExpression?.method === "reload" &&
    lastExpression?.variable === variable;

  if (shouldSkip) return null;

  return patchEvent(options);
};
