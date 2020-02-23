import { loadEvents } from "@qawolf/test";
import { pick } from "lodash";
import { buildClickSteps } from "../";

describe("buildClickSteps", () => {
  let clickButtons: any[];
  let clickRadioLabelEvents: any[];
  let loginEvents: any[];
  let selectEvents: any[];

  beforeAll(async () => {
    clickButtons = await loadEvents("clickButtons");
    clickRadioLabelEvents = await loadEvents("clickRadioLabel");
    loginEvents = await loadEvents("login");
    selectEvents = await loadEvents("selectNative");
  });

  it("builds one click per group of mousedown/click events", () => {
    const steps = buildClickSteps(clickButtons);
    expect(
      // snapshot to test it includes the original event index
      steps.map(step => pick(step, "cssSelector", "index"))
    ).toMatchSnapshot();
  });

  it("skips click triggered by Enter", () => {
    const steps = buildClickSteps(loginEvents);

    expect(steps.length).toEqual(2);

    // click on initial input
    expect(steps[0].html.node.attrs.id).toEqual("username");

    // click logout
    expect(steps[1].html.node.attrs.innertext).toEqual("Log out");
  });

  it("skips click on select", () => {
    const steps = buildClickSteps(selectEvents);
    expect(steps.length).toBe(0);
  });

  it("prefers clicks on inputs", () => {
    const steps = buildClickSteps(clickRadioLabelEvents);
    expect(steps.map(step => step.cssSelector)).toMatchSnapshot();
  });
});
