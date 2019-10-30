import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let loginEvents: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("login");
  });

  it("builds correct steps for login", async () => {
    const steps = buildClickSteps(loginEvents);

    expect(steps.length).toEqual(3);

    // link to form auth
    expect(steps[0].target.xpath).toEqual("//*[@id='content']/ul/li[18]/a");

    // login button
    expect(steps[1].target.xpath).toEqual("//*[@id='login']/button");

    // logout button
    expect(steps[2].target.xpath).toEqual("//*[@id='content']/div/a/i");
  });
});
