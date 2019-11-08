import { loadEvents } from "@qawolf/fixtures";
import { buildSelectSteps } from "../";

describe("buildSelectSteps", () => {
  let selectEvents: any[];

  beforeAll(async () => {
    selectEvents = await loadEvents("select");
  });

  it("builds correct steps for login", async () => {
    const steps = buildSelectSteps(selectEvents);
    expect(steps.length).toEqual(1);

    expect(steps[0].target.xpath).toEqual("//*[@id='dropdown']");
    expect(steps[0].value).toEqual("2");
  });
});
