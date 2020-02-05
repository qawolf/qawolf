import { loadWorkflow } from "@qawolf/fixtures";
import { Step } from "@qawolf/types";
import { buildStepsCode } from "../src/buildStepsCode";

describe("buildStepsCode", () => {
  let steps: Step[];

  beforeAll(async () => {
    const workflow = await loadWorkflow("scroll_login");
    steps = workflow.steps;
  });

  it("builds test steps", async () => {
    let code = buildStepsCode({ isTest: true, startIndex: 0, steps });
    expect(code).toMatchSnapshot();

    code = buildStepsCode({ isTest: true, startIndex: 3, steps });
    expect(code).toMatchSnapshot();
  });

  it("builds script steps", async () => {
    let code = buildStepsCode({ startIndex: 0, steps });
    expect(code).toMatchSnapshot();

    code = buildStepsCode({ startIndex: 3, steps });
    expect(code).toMatchSnapshot();
  });
});
