import { loadEvents } from "@qawolf/fixtures";
import { ElementEvent } from "@qawolf/types";
import { CodeUpdater, CREATE_CODE_SYMBOL } from "../src/CodeUpdater";
import { last, pick } from "lodash";

let events: ElementEvent[];

beforeAll(async () => {
  events = await loadEvents("scroll_login");
});

describe("CodeUpdater.canUpdate", () => {
  it("returns true when the create symbol is found", () => {
    expect(CodeUpdater.canUpdate(`someCode();\n${CREATE_CODE_SYMBOL}`)).toBe(
      true
    );
  });

  it("returns false when the create symbol is missing", () => {
    expect(CodeUpdater.canUpdate("")).toBe(false);
  });
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

describe("CodeUpdater.updateCode", () => {
  it("replaces the create symbol with new steps", () => {
    for (let isTest of [true, false]) {
      const codeUpdater = new CodeUpdater({
        isTest,
        name: "myTest",
        url: "localhost"
      });

      const codeToUpdate = `myOtherCode();\n${CREATE_CODE_SYMBOL}`;

      let updatedCode = codeUpdater.updateCode(codeToUpdate);
      // no events have happened so it should be the same code
      expect(updatedCode).toEqual(updatedCode);

      // now it should have new code
      codeUpdater.prepareSteps(events);
      updatedCode = codeUpdater.updateCode(codeToUpdate);
      expect(updatedCode).toMatchSnapshot(
        isTest ? "createTestSteps" : "createScriptSteps"
      );
    }
  });
});
