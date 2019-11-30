import { loadEvents } from "@qawolf/fixtures";
import { buildScrollSteps } from "../";

describe("buildScrollSteps", () => {
  let events: any[];

  beforeAll(async () => {
    events = await loadEvents("scroll_login");
  });

  it("builds expected steps", async () => {
    const steps = buildScrollSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
