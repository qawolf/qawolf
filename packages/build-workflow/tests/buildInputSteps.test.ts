import { loadEvents } from "@qawolf/fixtures";
import { buildInputSteps } from "../";

describe("buildInputSteps", () => {
  let loginEvents: any[];
  let searchAirbnb: any[];
  beforeAll(async () => {
    loginEvents = await loadEvents("login");
    searchAirbnb = await loadEvents("airbnb");
  });

  it("builds correct steps for login", async () => {
    const steps = buildInputSteps(loginEvents);
    expect(steps.length).toEqual(2);

    expect(steps[0].target.xpath).toEqual("//*[@id='username']");
    expect(steps[1].target.xpath).toEqual("//*[@id='password']");
  });

  it("builds correct steps for search airbnb", async () => {
    const steps = buildInputSteps(searchAirbnb);

    expect(steps[0].value).toEqual("Fri, Oct 25");
    expect(steps[0].target.xpath).toEqual("//*[@id='checkin_input']");

    expect(steps[1].value).toEqual("Sat, Oct 26");
    expect(steps[1].target.xpath).toEqual("//*[@id='checkout_input']");

    expect(steps[2].value).toEqual("nyc");
    expect(steps[2].target.xpath).toEqual(
      "//*[@id='Koan-magic-carpet-koan-search-bar__input']"
    );
  });
});
