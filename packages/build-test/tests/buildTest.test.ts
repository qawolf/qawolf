// import directly since fixtures are not exported
import { loadWorkflow } from "@qawolf/fixtures";
import { buildTest } from "../src/buildTest";

describe("buildTest", () => {
  it("builds a test from a workflow", async () => {
    const workflow = await loadWorkflow("scroll_login");
    const testString = buildTest(workflow);
    expect(testString).toMatchSnapshot();
  });
});
