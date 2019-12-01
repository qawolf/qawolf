// import directly since fixtures are not exported
import { loadWorkflow } from "@qawolf/fixtures";
import { deserializeWorkflow } from "@qawolf/web";
import { buildTest } from "../src/buildTest";

describe("buildTest", () => {
  it("builds a test from a workflow", async () => {
    const workflow = deserializeWorkflow(await loadWorkflow("scroll_login"));
    const testString = buildTest(workflow);
    expect(testString).toMatchSnapshot();
  });
});
