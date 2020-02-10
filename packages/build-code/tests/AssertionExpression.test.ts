import { AssertionExpression } from "../src/AssertionExpression";
import { stepExpression } from "./fixtures";

describe("AssertionExpression.code()", () => {
  it("builds assertion code", () => {
    expect(new AssertionExpression(stepExpression).code()).toMatchSnapshot();
  });
});
