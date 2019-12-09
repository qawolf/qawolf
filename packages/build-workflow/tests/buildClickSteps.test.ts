import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let loginEvents: any[];
  let clickEvents: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("scroll_login");
    clickEvents = await loadEvents("click_username");
  });

  it("builds expected steps", async () => {
    const steps = buildClickSteps(loginEvents);
    expect(steps).toMatchSnapshot();
  });

  it("builds a click step on an input if it is not followed by a type event", async () => {
    const steps = buildClickSteps(clickEvents);
    expect(steps).toMatchSnapshot();
  });
});
