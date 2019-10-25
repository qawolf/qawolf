import { loadEvents } from "@qawolf/fixtures";
import { buildClickSteps, buildInputSteps, buildSteps } from "../";

let loginEvents: any[];
let searchAirbnb: any[];

beforeAll(async () => {
  loginEvents = await loadEvents("login");
  searchAirbnb = await loadEvents("airbnb");
});

describe("buildClickSteps", () => {
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

describe("buildInputSteps", () => {
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

describe("buildSteps", () => {
  it("orders events properly", () => {
    const steps = buildSteps(searchAirbnb);

    expect(steps.map(step => step.index)).toEqual([0, 1, 2, 3, 4]);

    expect(steps.map(step => step.action as string)).toEqual([
      "input",
      "input",
      "input",
      "click",
      "click"
    ]);

    expect(steps.map(step => step.target.xpath)).toEqual([
      "//*[@id='checkin_input']",
      "//*[@id='checkout_input']",
      "//*[@id='Koan-magic-carpet-koan-search-bar__input']",
      "//*[@id='Koan-magic-carpet-koan-search-bar__option-0']/div[2]",
      "//*[@id='FMP-target']/div/div[1]/div/div/div/div/div/div[2]/div/form/div[4]/div/button"
    ]);
  });
});
