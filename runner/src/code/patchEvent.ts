import { Frame, Page } from "playwright";

import { ElementEvent, Variables, WindowEvent } from "../types";
import { ActionExpression } from "./parseCode";
import { patch, PATCH_HANDLE } from "./patch";

type PrepareSourceVariable = {
  declare?: boolean;
  pageOrFrame: Frame | Page;
  variables: Variables;
};

export type PrepareSourceVariables = {
  declare?: boolean;
  expressions: (ActionExpression | null)[];
  event: ElementEvent | WindowEvent;
  variables: Variables;
};

export type PatchEventOptions = PrepareSourceVariables & {
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
  if (selector !== undefined && event.action !== "keyboard.press") {
    args.push(formatArgument(selector));
  }

  if (event.value !== undefined) {
    args.push(formatArgument(event.value));
  }

  if (["goto", "reload"].includes(event.action)) {
    args.push('{ waitUntil: "domcontentloaded" }');
  }

  const line = `await ${variable}.${event.action}(${args.join(", ")});`;
  return line;
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

export const prepareSourceVariable = ({
  declare,
  pageOrFrame,
  variables,
}: PrepareSourceVariable): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prefix = (pageOrFrame as any).bringToFront ? "page" : "frame";

  let index = 1;
  let key: string;

  do {
    key = `${prefix}${index === 1 ? "" : index}`;
    index += 1;
  } while (Object.keys(variables).includes(key));

  if (declare) {
    // store it to prevent re-declaring it for future actions during code gen
    variables[key] = pageOrFrame;
  }

  return key;
};

export const prepareSourceVariables = ({
  declare,
  event,
  expressions,
  variables,
}: PrepareSourceVariables): SourceVariables => {
  let pageVariable = Object.keys(variables).find(
    (name) => variables[name] === event.page
  );

  let initializeCode = "";

  if (!pageVariable && event.action === "goto") {
    pageVariable = prepareSourceVariable({
      declare,
      pageOrFrame: event.page,
      variables,
    });
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
      frameVariable = prepareSourceVariable({
        declare,
        pageOrFrame: elementEvent.frame,
        variables,
      });

      const selector = formatArgument(elementEvent.frameSelector);
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

export const formatArgument = (value: string | null): string => {
  if (value === null) return "";

  // serialize newlines etc
  let escaped = JSON.stringify(value);
  // remove wrapper quotes
  escaped = escaped.substring(1, escaped.length - 1);
  // allow unescaped quotes
  escaped = escaped.replace(/\\"/g, '"');

  if (!escaped.includes(`"`)) return `"${escaped}"`;
  if (!escaped.includes(`'`)) return `'${escaped}'`;

  return "`" + escaped.replace(/`/g, "\\`") + "`";
};

export const patchEvent = (options: PatchEventOptions): string | null => {
  const { initializeCode, variable } = prepareSourceVariables({
    ...options,
    // we will patch the initialize code so we want to declare the variable
    // to prevent it from needing reinitialization on future events
    declare: true,
  });

  const eventCode = buildEventCode(options.event, variable);
  return patch(options.code, `${initializeCode}${eventCode}\n${PATCH_HANDLE}`);
};
