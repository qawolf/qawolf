import { loadEvents } from "@qawolf/fixtures";
import { buildSteps } from "../";

describe("buildSteps", () => {
  let searchAirbnb: any[];
  let scrollGoogle: any[];

  beforeAll(async () => {
    searchAirbnb = await loadEvents("airbnb");
    scrollGoogle = await loadEvents("google");
  });

  it("orders airbnb events properly", () => {
    const steps = buildSteps(searchAirbnb);
    expect(steps).toMatchSnapshot();
  });

  it("orders google events properly", () => {
    const steps = buildSteps(scrollGoogle);
    expect(steps).toMatchSnapshot();
  });
});
