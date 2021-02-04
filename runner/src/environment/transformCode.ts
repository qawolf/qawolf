import { Statement } from "typescript";

import { buildStatements } from "../ast";
import { Variables } from "../types";

type Expression = {
  code: string;
  endLine: number;
  startLine: number;
  variableNames: string[];
};

type FilterExpressions = {
  endLine?: number;
  expressions: Expression[];
  startLine?: number;
};

export type TransformCode = {
  code: string;
  endLine?: number;
  helpers: string;
  startLine?: number;
  variables: Variables;
};

const allowRedeclaration = (code: string) => {
  if (code.startsWith("const ")) return code.replace("const ", "var ");
  if (code.startsWith("let ")) return code.replace("let ", "var ");
  return code;
};

const filterExpressions = ({
  endLine,
  expressions,
  startLine,
}: FilterExpressions): Expression[] => {
  if (!endLine || !startLine || startLine > endLine) return expressions;
  // find the first expression that ends after startLine
  const startIndex = expressions.findIndex((e) => e.endLine >= startLine);
  // find the first expression that starts after endLine
  // we grab all expressions before this since slice does not include endIndex
  let endIndex = expressions.findIndex((e) => e.startLine > endLine);
  // include all remaining expressions if they all start before endLine
  if (endIndex === -1) {
    endIndex = expressions.length;
  }

  return expressions.slice(startIndex, endIndex);
};

export const getVariableNames = (statement: Statement): string[] => {
  const variableNames: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redeclareVariable = (statement as any).expression?.left?.escapedText;
  if (redeclareVariable) variableNames.push(redeclareVariable);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const declarations = (statement as any).declarationList?.declarations;
  if (!declarations || !declarations.length) return variableNames;

  // support multiple declarations: "const a, b ="
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declarations.forEach((declaration: any) => {
    // get the top level variable name "const a ="
    const topLevelVariable = declaration.name?.escapedText;
    if (topLevelVariable) variableNames.push(topLevelVariable);

    // get the nested variable names "const { a, b } ="
    if (declaration.name?.elements) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      declaration.name?.elements.forEach((element: any) => {
        const nestedVariableName = element.name?.escapedText;
        if (nestedVariableName) {
          variableNames.push(nestedVariableName);
        }
      });
    }
  });

  return variableNames;
};

export const getExpressions = (sourceCode: string): Expression[] => {
  let currentStartLine = 1;

  return buildStatements(sourceCode).map((s) => {
    let code = sourceCode.substring(s.pos, s.end);

    // strip leading newlines from expression
    const leadingNewLineCount = code.search(/[^\n]/);
    if (leadingNewLineCount) {
      currentStartLine += leadingNewLineCount;
      code = code.slice(leadingNewLineCount);
    }

    const innerNewLineCount = (code.match(/\n/g) || "").length;

    const expression = {
      code,
      endLine: currentStartLine + innerNewLineCount,
      startLine: currentStartLine,
      variableNames: getVariableNames(s),
    };

    currentStartLine += innerNewLineCount;

    return expression;
  });
};

export const transformCode = ({
  code,
  endLine,
  helpers,
  startLine,
  variables,
}: TransformCode): string => {
  const expressions = filterExpressions({
    endLine,
    expressions: getExpressions(code),
    startLine,
  });

  const lines: string[] = [];
  const variableNames: string[] = [];

  expressions.forEach((e) => {
    lines.push(`if (!vmLineStarted(${e.endLine})) return;`);

    lines.push(allowRedeclaration(e.code));

    if (e.variableNames.length) {
      variableNames.push(...e.variableNames);

      // set the declared variables so it gets passed to the next invocation
      e.variableNames.forEach((name) => {
        lines.push(`variables["${name}"] = ${name};`);
      });
    }
  });

  return `
const webEditorCode = async (variables, { vmEnv, vmLineStarted }) => {
process.env = { ...process.env, ...vmEnv };
${helpers}
var { ${Object.keys(variables).join(", ")}  } = variables;
${lines.join("\n")}
};

module.exports = webEditorCode;
`;
};
