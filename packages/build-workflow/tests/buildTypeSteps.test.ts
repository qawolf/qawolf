import { loadEvents } from "@qawolf/fixtures";
import { buildTypeSteps } from "../";

describe("buildTypeSteps", () => {
  let loginEvents: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("login");
  });

  it("builds correct steps for login", async () => {
    const steps = buildTypeSteps(loginEvents);

    expect(steps.length).toEqual(3);

    expect(steps[0].target.xpath).toEqual("//*[@id='username']");
    expect(steps[0].value).toEqual(
      "↓KeyT↑KeyT↓KeyO↑KeyO↓KeyM↑KeyM↓KeyS↑KeyS↓KeyM↑KeyM↓KeyI↑KeyI↓KeyT↑KeyT↓KeyH↑KeyH"
    );

    expect(steps[1].target.xpath).toEqual("//*[@id='password']");
    expect(steps[1].value).toEqual(
      "↓ShiftLeft↓KeyS↑ShiftLeft↑KeyS↓KeyU↑KeyU↓KeyP↑KeyP↓KeyE↑KeyE↓KeyR↑KeyR↓ShiftLeft↓KeyS↑ShiftLeft↑KeyS↓KeyE↑KeyE↓KeyC↑KeyC↓KeyR↑KeyR↓KeyE↑KeyE↓KeyT↑KeyT↓ShiftLeft↓KeyP↑KeyP↑ShiftLeft↓KeyA↑KeyA↓KeyS↑KeyS↓KeyS↑KeyS↓KeyW↑KeyW↓KeyO↑KeyO↓KeyR↑KeyR↓KeyD↑KeyD↓ShiftLeft↓Digit1↑ShiftLeft↑Digit1"
    );

    expect(steps[2].target.xpath).toEqual("//*[@id='password']");
    expect(steps[2].value).toEqual("↓Enter↑Enter");
  });
});
