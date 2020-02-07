import { loadEvents } from "@qawolf/fixtures";
import { buildSteps } from "../";

describe("buildSteps", () => {
  let events: any[];

  beforeAll(async () => {
    events = await loadEvents("scroll_login");
  });

  it("builds expected steps", () => {
    const steps = buildSteps({ events });
    expect(steps).toMatchSnapshot();
  });
});
