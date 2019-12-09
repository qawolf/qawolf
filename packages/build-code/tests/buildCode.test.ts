import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { buildCode } from "../src/buildCode";

let workflow: Workflow;

describe("buildCode", () => {
  beforeAll(async () => {
    workflow = await loadWorkflow("scroll_login");
  });

  it("builds a script for a workflow", async () => {
    const code = buildCode({ workflow });
    expect(code).toMatchSnapshot();
  });

  it("builds a test for a workflow", async () => {
    const code = buildCode({ test: true, workflow });
    expect(code).toMatchSnapshot();
  });
});
