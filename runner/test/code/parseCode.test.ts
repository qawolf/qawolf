import { buildStatements } from "../../src/ast";
import {
  buildActionExpression,
  parseActionExpressions,
  selectAwaitChildExpression,
} from "../../src/code/parseCode";
import { PATCH_HANDLE } from "../../src/code/patch";

describe("buildActionExpression", () => {
  const statements = buildStatements(
    "await page.click('.hello');\nawait page2.fill('.hello', 'world')\nawait page.fill(`'template'`, `\"args\"`);\nconst hello = 'world';\nawait something();"
  );

  it("parses the variable, method, and arguments", () => {
    expect(buildActionExpression(statements[0])).toEqual({
      args: [{ end: 25, pos: 17, text: ".hello" }],
      method: "click",
      statement: statements[0],
      variable: "page",
    });

    expect(buildActionExpression(statements[1])).toEqual({
      args: [
        { end: 53, pos: 45, text: ".hello" },
        { end: 62, pos: 54, text: "world" },
      ],
      method: "fill",
      statement: statements[1],
      variable: "page2",
    });

    // parses the text from template args
    expect(buildActionExpression(statements[2])).toEqual({
      args: [
        { end: 92, pos: 80, text: "'template'" },
        { end: 102, pos: 93, text: '"args"' },
      ],
      method: "fill",
      statement: statements[2],
      variable: "page",
    });
  });

  it("returns null if the statement is not a call expression on a variable's property", () => {
    expect(buildActionExpression(statements[3])).toEqual(null);
    expect(buildActionExpression(statements[4])).toEqual(null);
  });
});

describe("parseActionExpressions", () => {
  it("parses code up to the patch handle", () => {
    const expressions = parseActionExpressions(
      `await page.click('.hello');${PATCH_HANDLE}await page.press('.hello', 'Enter');`
    );

    expect(expressions).toHaveLength(1);
  });
});

describe("selectAwaitChildExpression", () => {
  it("returns the await's expression", () => {
    const code = `await page.click('.hello');\n   await   page.fill('.hello', 'world');  ${PATCH_HANDLE}`;
    const expressions = parseActionExpressions(code);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(selectAwaitChildExpression(code, expressions[0]!.statement)).toEqual(
      "page.click('.hello')"
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(selectAwaitChildExpression(code, expressions[1]!.statement)).toEqual(
      "page.fill('.hello', 'world')"
    );
  });
});
