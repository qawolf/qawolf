import { loadEvents } from "@qawolf/test";
import { Step } from "@qawolf/types";
import { buildSteps } from "@qawolf/build-workflow";
import { buildStepsCode } from "../src/buildStepsCode";

describe("buildStepsCode", () => {
  let steps: Step[];

  beforeAll(async () => {
    const events = await loadEvents("threePages");
    steps = buildSteps({ events });
  });

  it("builds script steps", async () => {
    const code = buildStepsCode({ steps });
    expect(code).toMatchSnapshot();
  });

  it("builds test steps", async () => {
    const code = buildStepsCode({ isTest: true, steps });
    expect(code).toMatchSnapshot();
  });

  it("works for multiple pages", async () => {
    // test starting at index 2, since that is on a new page
    const code = buildStepsCode({ startIndex: 2, isTest: true, steps });
    expect(code).toMatchSnapshot();
  });
});
