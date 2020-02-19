import { loadEvents } from "@qawolf/test";
import { buildTypeSteps } from "../";

describe("buildTypeSteps", () => {
  it("builds expected steps for login", async () => {
    const events = await loadEvents("scroll_login");
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });

  it("builds expected steps for selectall", async () => {
    const events = await loadEvents("selectall");
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });

  it("builds expected steps for hotkeys", async () => {
    const events = await loadEvents("githubIssuesShortcut");
    const steps = buildTypeSteps(events);
    expect(steps).toMatchSnapshot();
  });
});
