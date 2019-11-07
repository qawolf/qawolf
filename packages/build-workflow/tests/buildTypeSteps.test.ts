import { loadEvents } from "@qawolf/fixtures";
import { buildTypeSteps } from "../";

describe("buildTypeSteps", () => {
  let loginEvents: any[];
  let pasteEvents: any[];

  beforeAll(async () => {
    loginEvents = await loadEvents("login");
    pasteEvents = await loadEvents("paste");
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

  it("builds correct steps for paste", async () => {
    const steps = buildTypeSteps(pasteEvents);

    expect(steps[0].value).toEqual(
      "↓Shift↓KeyS↑KeyS↑Shift↓KeyU↑KeyU↓KeyP↑KeyP↓KeyE↑KeyE↓KeyR↑KeyR↓Shift↓KeyS↑KeyS↑Shift↓KeyE↑KeyE↓KeyC↑KeyC↓KeyR↑KeyR↓KeyE↑KeyE↓KeyT↑KeyT↓Shift↓KeyP↑KeyP↑Shift↓KeyA↑KeyA↓KeyS↑KeyS↓KeyS↑KeyS↓KeyW↑KeyW↓KeyO↑KeyO↓KeyR↑KeyR↓KeyD↑KeyD↓Shift↓Digit1↑Digit1↑Shift"
    );

    expect(steps[1].value).toEqual(
      "↓MetaLeft↓KeyA↑MetaLeft↓Backspace↑Backspace↓KeyT↑KeyT↓KeyO↑KeyO↓KeyM↑KeyM↓KeyS↑KeyS↓KeyM↑KeyM↓KeyI↑KeyI↓KeyT↑KeyT↓KeyH↑KeyH↑KeyA"
    );

    expect(steps[2].value).toEqual(
      "↓Shift↓KeyS↑KeyS↑Shift↓KeyU↑KeyU↓KeyP↑KeyP↓KeyE↑KeyE↓KeyR↑KeyR↓Shift↓KeyS↑KeyS↑Shift↓KeyE↑KeyE↓KeyC↑KeyC↓KeyR↑KeyR↓KeyE↑KeyE↓KeyT↑KeyT↓Shift↓KeyP↑KeyP↑Shift↓KeyA↓KeyS↑KeyS↓KeyS↑KeyS↓KeyW↑KeyW↓KeyO↑KeyO↓KeyR↑KeyR↓KeyD↑KeyD↓Shift↓Digit1↑Digit1↑Shift"
    );
  });
});
