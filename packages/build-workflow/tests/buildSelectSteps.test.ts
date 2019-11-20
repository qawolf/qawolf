import { loadEvents } from "@qawolf/fixtures";
import { buildSelectSteps } from "../";

describe("buildSelectSteps", () => {
  let selectEvents: any[];

  beforeAll(async () => {
    selectEvents = await loadEvents("select");
  });

  it("builds expected steps", async () => {
    const steps = buildSelectSteps(selectEvents);
    expect(steps).toMatchSnapshot();
  });
});
