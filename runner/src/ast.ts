import ts from "typescript";

export const buildStatements = (
  sourceCode: string
): ts.NodeArray<ts.Statement> =>
  ts.createSourceFile("source.ts", sourceCode, ts.ScriptTarget.Latest)
    .statements;
