import { hasText } from "@qawolf/browser";
import { CONFIG } from "@qawolf/config";
import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { Runner } from "../src/Runner";

describe("Runner", () => {
  let workflow: Workflow;

  beforeAll(async () => {
    workflow = await loadWorkflow("click_input");
  });

  it("runs a workflow", async () => {
    const runner = await Runner.create({
      ...workflow,
      steps: workflow.steps,
      url: `${CONFIG.testUrl}login`
    });
    await runner.run();
    await runner.close();
  });

  it("finds property of element", async () => {
    const runner = await Runner.create({
      ...workflow,
      // need to rename for the video to have a separate path
      name: "dropdown",
      url: `${CONFIG.testUrl}dropdown`
    });

    const id = await runner.findProperty({
      selector: "select",
      property: "id"
    });
    expect(id).toBe("dropdown");

    await runner.close();
  });
});
