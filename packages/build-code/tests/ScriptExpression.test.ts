import { ScriptExpression } from "../src/ScriptExpression";
import { stepExpression } from "./fixtures";

describe("ScriptExpression.code()", () => {
  it("builds assertion code", () => {
    expect(new ScriptExpression(stepExpression).code()).toMatchSnapshot();
  });
});
