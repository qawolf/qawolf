import { buildStatements } from "../../src/ast";
import {
  getExpressions,
  getVariableNames,
  transformCode,
} from "../../src/environment/transformCode";

const simpleSourceCode = 'await page.click("a");';

const sourceCode = `

await page.click(
  '[placeholder="Search by location.."]'
);
await page.fill('[placeholder="Search by location.."]', "Lakeside Village");
await page.click("a");

// comment about function
function myFunction() {
  const myInnerConst = "hi";
  console.log("SUP"!);
}

myFunction();

await myFunction();

var myVar = "hello";
const myConst =  "world";
let myLet = "!";
myLet = "!!";
`;

const sourceCode2 = `const todo = "hi there!";
await page.goto('http://todomvc.com/examples/react');

// enter new todo
await page.click(".new-todo");

await page.fill(".new-todo", todo);
await page.press(".new-todo", "Enter");

// complete todo
await page.click(
    ".toggle"
);

// clear completed
await page.click(".clear-completed");`;

const helpers = `function assertWelcomeText(page) {
  return assertText(page, "Welcome!");
}`;

describe("getExpressions", () => {
  it("parses expressions from code", () => {
    expect(getExpressions(simpleSourceCode)).toMatchSnapshot();
    expect(getExpressions(sourceCode)).toMatchSnapshot();
    expect(getExpressions(sourceCode2)).toMatchSnapshot();
  });
});

describe("getVariableName", () => {
  const getCodeVariableNames = (code: string, statement = 0): string[] => {
    const statements = buildStatements(code);
    return getVariableNames(statements[statement]);
  };

  it("parses top level variables", () => {
    expect(getCodeVariableNames(`var a = "1";`)).toEqual(["a"]);
  });

  it("parses nested variables", () => {
    expect(getCodeVariableNames(`var { b, c } = { b: 2, c: 3 };`)).toEqual([
      "b",
      "c",
    ]);
  });

  it("parses multiple declarations", () => {
    expect(
      getCodeVariableNames(`var [d, e], [f, g] = [4, 5], [6, 7];`)
    ).toEqual(["d", "e", "f", "g"]);
  });

  it("parses redeclarations", () => {
    expect(getCodeVariableNames(`var a = 0;\na = "2";`, 1)).toEqual(["a"]);
  });
});

describe("transformCode", () => {
  it("transforms web editor code", () => {
    expect(
      transformCode({
        code: simpleSourceCode,
        helpers: "",
        variables: { page: "page" },
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode,
        helpers: "",
        variables: { page: "page", x: 1, y: null, z: "hi" },
      })
    ).toMatchSnapshot();
  });

  it("takes start and end lines into account", () => {
    expect(
      transformCode({
        code: simpleSourceCode,
        helpers: "",
        endLine: 1,
        startLine: 1,
        variables: { page: "page" },
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode,
        helpers: "",
        endLine: 5,
        startLine: 4,
        variables: { page: "page", x: 1, y: null, z: "hi" },
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode,
        helpers: "",
        endLine: 12,
        startLine: 2,
        variables: { page: "page", x: 1, y: null, z: "hi" },
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode2,
        helpers: "",
        endLine: 4,
        startLine: 1,
        variables: {},
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode2,
        endLine: 8,
        helpers: "",
        startLine: 6,
        variables: {},
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode2,
        helpers: "",
        endLine: 15,
        startLine: 10,
        variables: {},
      })
    ).toMatchSnapshot();
  });

  it("includes helpers if specified", () => {
    expect(
      transformCode({
        code: simpleSourceCode,
        helpers,
        variables: { page: "page" },
      })
    ).toMatchSnapshot();

    expect(
      transformCode({
        code: sourceCode2,
        helpers,
        endLine: 15,
        startLine: 10,
        variables: {},
      })
    ).toMatchSnapshot();
  });
});
