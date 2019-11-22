import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let events: any[];
  let clickOnPasswordEvents: any[];

  beforeAll(async () => {
    events = await loadEvents("scroll_click_type");
    clickOnPasswordEvents = await loadEvents("click_on_password");
  });

  it("builds expected steps", async () => {
    const steps = buildClickSteps(events);
    expect(steps).toMatchSnapshot();
  });

  it("builds a click step on an input if it is not followed by a type event", async () => {
    const steps = buildClickSteps(clickOnPasswordEvents);
    expect(steps).toMatchSnapshot();
  });
});
