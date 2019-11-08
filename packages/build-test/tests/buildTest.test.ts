// import directly since fixtures are not exported
import { loginWorkflow } from "../../build-workflow/fixtures/loginWorkflow";
import { buildTest } from "../src/buildTest";

describe("buildTest", () => {
  it("builds a test from a workflow", async () => {
    const testString = buildTest(loginWorkflow);
    expect(testString).toMatchSnapshot();
  });
});
