import { loadEvents } from "@qawolf/fixtures";
import { buildScrollSteps } from "../";

describe("buildScrollSteps", () => {
  let scrollGoogle: any[];

  beforeAll(async () => {
    scrollGoogle = await loadEvents("google");
  });

  it("builds correct steps for scroll google", async () => {
    const steps = buildScrollSteps(scrollGoogle);
    expect(steps).toMatchSnapshot();
  });
});
