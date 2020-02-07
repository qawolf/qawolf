import { loadEvents } from "@qawolf/fixtures";
import { ElementEvent } from "@qawolf/types";
import { StepBuilder } from "../src/StepBuilder";

describe("StepBuilder", () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = await loadEvents("scroll_login");
  });

  it("builds steps for events", () => {
    // should start steps at 10
    const builder = new StepBuilder({ startIndex: 10 });
    expect(builder.steps()).toEqual([]);

    const splitIndex = events.length / 2;

    events.slice(0, splitIndex).forEach(event => builder.pushEvent(event));
    const stepsOne = builder.steps().slice();
    expect(stepsOne).toMatchSnapshot();
    expect(stepsOne).toHaveLength(2);

    events.slice(splitIndex).forEach(event => builder.pushEvent(event));
    const stepsTwo = builder.steps().slice(stepsOne.length);
    expect(stepsTwo).toMatchSnapshot();
    expect(stepsTwo).toHaveLength(6);
  });
});
