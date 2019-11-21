import { loadEvents } from "@qawolf/fixtures";
import { buildScrollSteps } from "../";

describe("buildScrollSteps", () => {
  let scroll: any[];

  beforeAll(async () => {
    scroll = await loadEvents("scroll_click_type");
  });

  it("builds expected steps", async () => {
    const steps = buildScrollSteps(scroll);
    expect(steps).toMatchSnapshot();
  });
});
