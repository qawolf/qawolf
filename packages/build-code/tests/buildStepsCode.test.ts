import { loadWorkflow } from "@qawolf/test";
import { Step } from "@qawolf/types";
import { buildStepsCode } from "../src/buildStepsCode";

describe("buildStepsCode", () => {
  let steps: Step[];

  beforeAll(async () => {
    const workflow = await loadWorkflow("scroll_login");
    steps = workflow.steps;
  });

  it("builds test steps", async () => {
    const code = buildStepsCode({ isTest: true, steps });
    expect(code).toMatchSnapshot();
  });

  it("builds script steps", async () => {
    const code = buildStepsCode({ steps });
    expect(code).toMatchSnapshot();
  });
});
