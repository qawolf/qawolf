import { loadEvents } from "@qawolf/fixtures";
import { buildSteps } from "../";

describe("buildSteps", () => {
  let scrollGoogle: any[];

  beforeAll(async () => {
    scrollGoogle = await loadEvents("google");
  });

  it("orders google events properly", () => {
    const steps = buildSteps(scrollGoogle);
    expect(steps).toMatchSnapshot();
  });
});
