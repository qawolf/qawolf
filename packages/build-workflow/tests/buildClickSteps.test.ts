import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let events: any[];

  beforeAll(async () => {
    events = await loadEvents("scroll_click_type");
  });

  it("builds expected steps", async () => {
    const steps = buildClickSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
