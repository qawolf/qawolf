import { loadEvents } from "@qawolf/fixtures";
import { buildTypeSteps } from "../";

describe("buildTypeSteps", () => {
  let events: any[];

  beforeAll(async () => {
    events = await loadEvents("login");
  });

  it("builds expected steps", async () => {
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
