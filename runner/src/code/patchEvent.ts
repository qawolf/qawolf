import { Frame, Page } from "playwright";

import { ElementEvent, Variables, WindowEvent } from "../types";
import { ActionExpression } from "./parseCode";
import { patch, PATCH_HANDLE } from "./patch";

export type FindSourceOptions = {
  expressions: (ActionExpression | null)[];
  event: ElementEvent | WindowEvent;
  variables: Variables;
};

export type PatchEventOptions = FindSourceOptions & {
  code: string;
};

export type SourceVariables = {
  pageVariable: string;
  frameVariable?: string;
  initializeCode: string;
  variable: string;
};

export const buildEventCode = (
  event: ElementEvent | WindowEvent,
  variable: string
): string => {
  const args: string[] = [];

  const selector = (event as ElementEvent).selector;
  if (selector !== undefined) {
    args.push(formatSelector(selector));
  }

  if (event.value !== undefined) {
    args.push(JSON.stringify(event.value));
  }

  if (["goto", "reload"].includes(event.action)) {
    args.push('{ waitUntil: "domcontentloaded" }');
  }

  const line = `await ${variable}.${event.action}(${args.join(", ")});`;
  return line;
};

export const declareSourceVariable = (
  pageOrFrame: Frame | Page,
  variables: Variables
): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prefix = (pageOrFrame as any).bringToFront ? "page" : "frame";

  let index = 1;
  let key: string;

  do {
    key = `${prefix}${index === 1 ? "" : index}`;
    index += 1;
  } while (Object.keys(variables).includes(key));

  // store it to prevent re-declaring it for future actions during code gen
  variables[key] = pageOrFrame;

  return key;
};

export const findLastPageVariable = (
  expressions: (ActionExpression | null)[],
  variables: Variables
): string | null => {
  for (let i = expressions.length - 1; i >= 0; i--) {
    // find the last page
    const variable = expressions[i]?.variable;
    if (!variable) continue;

    const maybePage = variables[variable] as Page | undefined;
    // it is a page if it has bringToFront
    if (maybePage?.bringToFront) return variable;
  }

  return null;
};

export const findSourceVariables = ({
  event,
  expressions,
  variables,
}: FindSourceOptions): SourceVariables => {
  let pageVariable = Object.keys(variables).find(
    (name) => variables[name] === event.page
  );

  let initializeCode = "";

  if (!pageVariable && event.action === "goto") {
    pageVariable = declareSourceVariable(event.page, variables);
    initializeCode = `const ${pageVariable} = await context.newPage();\n`;
  } else if (!pageVariable) {
    throw new Error("No matching page found");
  }

  let frameVariable: string | undefined = undefined;

  const elementEvent = event as ElementEvent;
  if (elementEvent.frameSelector) {
    if (!elementEvent.frame) throw new Error("No frame provided");

    frameVariable = Object.keys(variables).find(
      (name) => variables[name] === elementEvent.frame
    );

    if (!frameVariable) {
      frameVariable = declareSourceVariable(elementEvent.frame, variables);
      const selector = formatSelector(elementEvent.frameSelector);
      initializeCode = `const ${frameVariable} = await (await ${pageVariable}.waitForSelector(${selector})).contentFrame();\n`;
    }
  }

  // if the page changed, bring the page to front
  const lastPageVariable = findLastPageVariable(expressions, variables);
  if (
    lastPageVariable &&
    lastPageVariable !== pageVariable &&
    !["goto", "popup"].includes(event.action)
  ) {
    initializeCode = `await ${pageVariable}.bringToFront();\n` + initializeCode;
  }

  return {
    frameVariable,
    pageVariable,
    initializeCode,
    variable: frameVariable || pageVariable,
  };
};

export const formatSelector = (value: string | null): string => {
  if (value === null) return "";

  if (!value.includes(`"`)) return `"${value}"`;
  if (!value.includes(`'`)) return `'${value}'`;
  return "`" + value.replace(/`/g, "\\`") + "`";
};

export const patchEvent = (options: PatchEventOptions): string | null => {
  const { initializeCode, variable } = findSourceVariables(options);
  const eventCode = buildEventCode(options.event, variable);
  return patch(options.code, `${initializeCode}${eventCode}\n${PATCH_HANDLE}`);
};
