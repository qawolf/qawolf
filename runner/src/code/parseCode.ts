import ts from "typescript";

import { buildStatements } from "../ast";
import { PATCH_HANDLE } from "./patchUtils";

type Argument = {
  pos: number;
  end: number;
  text?: string;
};

export type ActionExpression = {
  args: Argument[];
  method: string;
  statement: ts.ExpressionStatement;
  variable: string;
};

// Parse action expressions: variable.method(...args)
export const buildActionExpression = (
  statement?: ts.Statement
): ActionExpression | null => {
  if (!statement || !ts.isExpressionStatement(statement)) return null;

  const awaitExpression = statement.expression as ts.AwaitExpression;
  if (!awaitExpression || !ts.isAwaitExpression(awaitExpression)) return null;

  const callExpression = awaitExpression.expression as ts.CallExpression;
  if (!callExpression || !ts.isCallExpression(callExpression)) return null;
  const propertyAccessExpression = callExpression.expression as ts.PropertyAccessExpression;
  if (
    !propertyAccessExpression ||
    !ts.isPropertyAccessExpression(propertyAccessExpression)
  )
    return null;

  const method = propertyAccessExpression.name.escapedText as string;

  const identifier = propertyAccessExpression.expression as ts.Identifier;
  if (!identifier || !ts.isIdentifier(identifier)) return null;

  const variable = identifier.escapedText as string;

  const args: Argument[] = callExpression.arguments.map((argument) => {
    let text;
    if (ts.isStringLiteral(argument) || ts.isTemplateLiteral(argument)) {
      text = (argument as ts.StringLiteral).text;
    }

    return {
      pos: argument.pos,
      end: argument.end,
      text,
    };
  });

  return {
    args,
    method,
    statement,
    variable,
  };
};

/**
 * Parse the code to find the action expressions.
 * @param code The code to parse.
 * @param tail Only parse the last "tail" expressions.
 */
export const parseActionExpressions = (
  code: string
): (ActionExpression | null)[] => {
  const patchIndex = code.indexOf(PATCH_HANDLE);

  const statements = buildStatements(code.substring(0, patchIndex));

  const expressions = statements.map((statement) =>
    buildActionExpression(statement)
  );

  return expressions;
};

export const selectAwaitChildExpression = (
  code: string,
  statement: ts.ExpressionStatement
): string => {
  const awaitExpression = statement.expression as ts.AwaitExpression;
  if (!awaitExpression || !ts.isAwaitExpression(awaitExpression)) return "";
  return code
    .substring(awaitExpression.expression.pos, awaitExpression.expression.end)
    .trimLeft();
};
