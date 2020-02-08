import { loadEvents } from "@qawolf/test";
import { buildSelectSteps } from "../";

describe("buildSelectSteps", () => {
  let events: any[];

  beforeAll(async () => {
    events = await loadEvents("dropdown");
  });

  it("builds expected steps", async () => {
    const steps = buildSelectSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
