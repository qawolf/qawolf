import { Frame, Page } from "playwright";

import { PlaywrightEvent,Variables } from "../types";
import { formatArgument } from "./formatArgument";
import { ActionExpression } from "./parseCode";

export type SourceVariables = {
  pageVariable: string;
  frameVariable?: string;
  initializeCode: string;
  variable: string;
};

export type PrepareSourceVariables = {
  declare?: boolean;
  expressions: (ActionExpression | null)[];
  event: PlaywrightEvent;
  shouldBringPageToFront?: boolean;
  shouldDeclarePageVariable?: boolean;
  variables: Variables;
};

export type PrepareSourceVariable = {
  declare?: boolean;
  pageOrFrame: Frame | Page;
  variables: Variables;
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
  declare = false,
  event,
  expressions,
  shouldBringPageToFront = false,
  shouldDeclarePageVariable = false,
  variables,
}: PrepareSourceVariables): SourceVariables => {
  let pageVariable = Object.keys(variables).find(
    (name) => variables[name] === event.page
  );

  let initializeCode = "";

  if (!pageVariable && shouldDeclarePageVariable) {
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

  if (event.frameSelector) {
    if (!event.frame) throw new Error("No frame provided");

    frameVariable = Object.keys(variables).find(
      (name) => variables[name] === event.frame
    );

    if (!frameVariable) {
      frameVariable = prepareSourceVariable({
        declare,
        pageOrFrame: event.frame,
        variables,
      });

      const selector = formatArgument(event.frameSelector);
      initializeCode = `const ${frameVariable} = await (await ${pageVariable}.waitForSelector(${selector})).contentFrame();\n`;
    }
  }

  // if the page changed, bring the page to front
  if (shouldBringPageToFront) {
    const lastPageVariable = findLastPageVariable(expressions, variables);
    if (lastPageVariable && lastPageVariable !== pageVariable) {
      initializeCode = `await ${pageVariable}.bringToFront();\n` + initializeCode;
    }
  }

  return {
    frameVariable,
    pageVariable,
    initializeCode,
    variable: frameVariable || pageVariable,
  };
};
