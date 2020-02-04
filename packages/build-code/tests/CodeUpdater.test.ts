import { loadEvents } from "@qawolf/fixtures";
import { ElementEvent } from "@qawolf/types";
import { CodeUpdater } from "../src/CodeUpdater";
import { last, pick } from "lodash";

let events: ElementEvent[];

beforeAll(async () => {
  events = await loadEvents("scroll_login");
});

describe("CodeUpdater.prepareSteps", () => {
  it("appends new steps", () => {
    const codeUpdater = new CodeUpdater({ name: "myTest", url: "localhost" });

    let numSteps = 0;

    let stepEvents: any[] = [];

    events.forEach(event => {
      codeUpdater.prepareSteps([event]);

      // track each event that causes a step to be created
      if (codeUpdater._steps.length !== numSteps) {
        stepEvents.push({
          event: pick(event, "name", "value"),
          step: last(codeUpdater._steps)!.action
        });

        numSteps = codeUpdater._steps.length;
      }
    });

    // test the events and new steps align properly
    expect(stepEvents).toMatchSnapshot();
  });
});

describe("CodeUpdater.createSteps", () => {
  it("logs an error when the create symbol is missing", () => {
    // TODO
  });

  it("replaces the create symbol with new steps", () => {
    // TODO
  });
});
