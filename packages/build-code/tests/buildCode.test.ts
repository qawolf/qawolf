import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { buildCode } from "../src/buildCode";

let workflow: Workflow;
let deviceWorkflow: Workflow;

describe("buildCode", () => {
  beforeAll(async () => {
    workflow = await loadWorkflow("scroll_login");
    deviceWorkflow = await loadWorkflow("scroll_login");
    deviceWorkflow.device = "iPhone 7";
  });

  it("builds a script for a workflow", async () => {
    let code = buildCode({ workflow });
    expect(code).toMatchSnapshot();

    code = buildCode({ workflow: deviceWorkflow });
    expect(code).toMatchSnapshot();
  });

  it("builds a test for a workflow", async () => {
    let code = buildCode({ test: true, workflow });
    expect(code).toMatchSnapshot();

    code = buildCode({ test: true, workflow: deviceWorkflow });
    expect(code).toMatchSnapshot();
  });
});
