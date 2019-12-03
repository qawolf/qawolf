import { CONFIG } from "@qawolf/config";
import { loadWorkflow } from "@qawolf/fixtures";
import { Workflow } from "@qawolf/types";
import { deserializeWorkflow } from "@qawolf/web";
import { Runner } from "../src/Runner";

describe("Runner", () => {
  let workflow: Workflow;

  beforeAll(async () => {
    workflow = deserializeWorkflow(await loadWorkflow("click_input"));
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
