import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let loginEvents: any[];
  let searchAirbnb: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("login");
    searchAirbnb = await loadEvents("airbnb");
  });

  it("builds correct steps for login", async () => {
    const steps = buildClickSteps(loginEvents);

    expect(steps.length).toEqual(2);

    // link to form auth
    expect(steps[0].target.xpath).toEqual("//*[@id='content']/ul/li[18]/a");

    // login button
    expect(steps[1].target.xpath).toEqual("//*[@id='login']/button/i");
  });

  it("ignores clicks on date tooltips for search airbnb", async () => {
    const steps = buildClickSteps(searchAirbnb);
    expect(steps.length).toEqual(2);

    // nyc item in dropdown
    expect(steps[0].target.xpath).toEqual(
      "//*[@id='Koan-magic-carpet-koan-search-bar__option-0']/div[2]"
    );

    expect(steps[1].target.inputType).toEqual("submit");
  });
});
