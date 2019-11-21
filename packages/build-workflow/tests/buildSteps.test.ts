import { loadEvents } from "@qawolf/fixtures";
import { buildSteps } from "../";

describe("buildSteps", () => {
  let scrollClickType: any[];

  beforeAll(async () => {
    scrollClickType = await loadEvents("scroll_click_type");
  });

  it("builds expected steps", () => {
    const steps = buildSteps(scrollClickType);
    expect(steps).toMatchSnapshot();
  });
});
