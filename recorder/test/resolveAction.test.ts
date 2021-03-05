import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import { shouldTrackFill, shouldTrackKeyPress } from "../src/resolveAction";
import { Action, PossibleAction } from "../src/types";
import { launch, LaunchResult } from "./utils";

const descriptor = (
  tag: string,
  isContentEditable = false,
  inputType?: string
): ElementDescriptor => ({
  isContentEditable,
  isInput: tag === "input",
  inputType,
  tag,
});

describe("resolveAction", () => {
  let launched: LaunchResult;

  beforeAll(async () => {
    launched = await launch();
  });

  afterAll(() => launched.browser.close());

  const getFreshPage = async (): Promise<Page> => {
    const page: Page = await launched.context.newPage();
    await page.goto(
      "file://" + require.resolve("./fixtures/resolveAction.html")
    );
    return page;
  };

  it("returns undefined for untrusted actions", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const mockAction: PossibleAction = {
        action: "click",
        isTrusted: false,
        target: null,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe(undefined);
  });

  it.each<Action>(["fill", "press"])(
    "returns undefined for clicks immediately after %s actions",
    async (previousActionName) => {
      const page = await getFreshPage();

      const result = await page.evaluate(
        ({ previousActionName }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const target = document.querySelector("body");

          const mockPreviousAction: PossibleAction = {
            action: previousActionName,
            isTrusted: true,
            target,
            time: 10002000,
            value: null,
          };

          const mockAction: PossibleAction = {
            action: "click",
            isTrusted: true,
            target,
            time: 10002040,
            value: null,
          };

          return qawolf.resolveAction(mockAction, mockPreviousAction);
        },
        { previousActionName }
      );

      expect(result).toBe(undefined);
    }
  );

  it("returns undefined for clicks on selects", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const mockAction: PossibleAction = {
        action: "click",
        isTrusted: false,
        target,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for actions on invisible targets", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(
        'input[type="hidden"]'
      ) as HTMLElement;

      const mockAction: PossibleAction = {
        action: "click",
        isTrusted: false,
        target,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe(undefined);
  });

  it("returns 'selectInput' for 'fill' action on a select", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const mockAction: PossibleAction = {
        action: "fill",
        isTrusted: true,
        target,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe("selectOption");
  });

  it("returns 'fill' for 'fill' action on an input", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(".textInput") as HTMLInputElement;

      const mockAction: PossibleAction = {
        action: "fill",
        isTrusted: true,
        target,
        time: Date.now(),
        value: qawolf.getInputElementValue(target),
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe("fill");
  });
});

describe("shouldTrackFill", () => {
  it("typing in a textarea creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("textarea"))).toBe(true);
  });

  it("typing in a contenteditable creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("div", true))).toBe(true);
  });

  it("typing in a text input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "text"))).toBe(true);
  });

  it("typing in a search input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "search"))).toBe(true);
  });

  it("typing in a browser date input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "date"))).toBe(true);
  });

  it("typing in a browser datetime-local input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "datetime-local"))).toBe(
      true
    );
  });

  it("typing in a browser time input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "time"))).toBe(true);
  });

  it("typing in a browser week input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "week"))).toBe(true);
  });

  it("typing in a browser month input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "month"))).toBe(true);
  });

  it("typing in a browser number input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "number"))).toBe(true);
  });

  it("typing in a browser email input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "email"))).toBe(true);
  });

  it("typing in a browser password input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "password"))).toBe(true);
  });

  it("typing in a browser phone number input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "tel"))).toBe(true);
  });

  it("typing in a browser url input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "url"))).toBe(true);
  });

  it("picking a color from a browser color input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "color"))).toBe(true);
  });

  it("picking a number on a browser range input creates a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "range"))).toBe(true);
  });

  it("clicking a checkbox does not create a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "checkbox"))).toBe(false);
  });

  it("clicking a radio button does not create a fill step", async () => {
    expect(shouldTrackFill(descriptor("input", false, "radio"))).toBe(false);
  });
});

describe("shouldTrackKeyPress", () => {
  it("pressing Enter with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Enter", descriptor("body"))).toBe(true);
  });

  it("pressing Enter with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Enter", descriptor("input"))).toBe(true);
  });

  it("pressing Enter with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Enter", descriptor("textarea"))).toBe(false);
  });

  it("pressing Enter with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Enter", descriptor("div", true))).toBe(false);
  });

  it("pressing Tab with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", descriptor("body"))).toBe(true);
  });

  it("pressing Tab with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", descriptor("input"))).toBe(true);
  });

  it("pressing Tab with focus on textarea creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", descriptor("textarea"))).toBe(true);
  });

  it("pressing Tab with focus on contenteditable element creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", descriptor("div", true))).toBe(true);
  });

  it("pressing Escape with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", descriptor("body"))).toBe(true);
  });

  it("pressing Escape with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", descriptor("input"))).toBe(true);
  });

  it("pressing Escape with focus on textarea creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", descriptor("textarea"))).toBe(true);
  });

  it("pressing Escape with focus on contenteditable element creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", descriptor("div", true))).toBe(true);
  });

  it("pressing a letter with focus on non-input does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", descriptor("body"))).toBe(false);
  });

  it("pressing a letter with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", descriptor("input"))).toBe(false);
  });

  it("pressing a letter with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", descriptor("textarea"))).toBe(false);
  });

  it("pressing a letter with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", descriptor("div", true))).toBe(false);
  });

  it("pressing Spacebar with focus on non-input does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", descriptor("body"))).toBe(false);
  });

  it("pressing Spacebar with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", descriptor("input"))).toBe(false);
  });

  it("pressing Spacebar with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", descriptor("textarea"))).toBe(false);
  });

  it("pressing Spacebar with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", descriptor("div", true))).toBe(false);
  });

  it("pressing ArrowDown with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", descriptor("body"))).toBe(true);
  });

  it("pressing ArrowDown with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", descriptor("input"))).toBe(false);
  });

  it("pressing ArrowDown with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", descriptor("textarea"))).toBe(
      false
    );
  });

  it("pressing ArrowDown with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", descriptor("div", true))).toBe(
      false
    );
  });

  it("pressing ArrowLeft with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", descriptor("body"))).toBe(true);
  });

  it("pressing ArrowLeft with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", descriptor("input"))).toBe(false);
  });

  it("pressing ArrowLeft with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", descriptor("textarea"))).toBe(
      false
    );
  });

  it("pressing ArrowLeft with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", descriptor("div", true))).toBe(
      false
    );
  });

  it("pressing ArrowRight with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", descriptor("body"))).toBe(true);
  });

  it("pressing ArrowRight with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", descriptor("input"))).toBe(false);
  });

  it("pressing ArrowRight with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", descriptor("textarea"))).toBe(
      false
    );
  });

  it("pressing ArrowRight with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", descriptor("div", true))).toBe(
      false
    );
  });

  it("pressing ArrowUp with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", descriptor("body"))).toBe(true);
  });

  it("pressing ArrowUp with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", descriptor("input"))).toBe(false);
  });

  it("pressing ArrowUp with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", descriptor("textarea"))).toBe(false);
  });

  it("pressing ArrowUp with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", descriptor("div", true))).toBe(false);
  });

  it("pressing Backspace with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", descriptor("body"))).toBe(true);
  });

  it("pressing Backspace with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", descriptor("input"))).toBe(false);
  });

  it("pressing Backspace with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", descriptor("textarea"))).toBe(
      false
    );
  });

  it("pressing Backspace with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", descriptor("div", true))).toBe(
      false
    );
  });

  it("pressing Delete with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Delete", descriptor("body"))).toBe(true);
  });

  it("pressing Delete with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", descriptor("input"))).toBe(false);
  });

  it("pressing Delete with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", descriptor("textarea"))).toBe(false);
  });

  it("pressing Delete with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", descriptor("div", true))).toBe(false);
  });
});
