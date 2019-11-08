import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let loginEvents: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("login");
  });

  it("builds correct steps for login", async () => {
    const steps = buildClickSteps(loginEvents);

    expect(steps.length).toEqual(2);

    // link to form auth
    expect(steps[0].target.xpath).toEqual("//*[@id='content']/ul/li[18]/a");

    // logout button
    expect(steps[1].target.xpath).toEqual("//*[@id='content']/div/a");
  });
});
