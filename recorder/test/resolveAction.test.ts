import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { shouldTrackFill, shouldTrackKeyPress } from "../src/resolveAction";
import { Action, Doc, PossibleAction } from "../src/types";
import { launch, LaunchResult } from "./utils";

function doc(name: string, isContentEditable = false, type?: string): Doc {
  return {
    name,
    attrs: {
      contenteditable: isContentEditable ? "true" : undefined,
      type,
    },
  };
}
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
    expect(shouldTrackFill(doc("textarea"))).toBe(true);
  });

  it("typing in a contenteditable creates a fill step", async () => {
    expect(shouldTrackFill(doc("div", true))).toBe(true);
  });

  it("typing in a text input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "text"))).toBe(true);
  });

  it("typing in a search input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "search"))).toBe(true);
  });

  it("typing in a browser date input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "date"))).toBe(true);
  });

  it("typing in a browser datetime-local input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "datetime-local"))).toBe(true);
  });

  it("typing in a browser time input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "time"))).toBe(true);
  });

  it("typing in a browser week input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "week"))).toBe(true);
  });

  it("typing in a browser month input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "month"))).toBe(true);
  });

  it("typing in a browser number input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "number"))).toBe(true);
  });

  it("typing in a browser email input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "email"))).toBe(true);
  });

  it("typing in a browser password input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "password"))).toBe(true);
  });

  it("typing in a browser phone number input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "tel"))).toBe(true);
  });

  it("typing in a browser url input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "url"))).toBe(true);
  });

  it("picking a color from a browser color input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "color"))).toBe(true);
  });

  it("picking a number on a browser range input creates a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "range"))).toBe(true);
  });

  it("clicking a checkbox does not create a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "checkbox"))).toBe(false);
  });

  it("clicking a radio button does not create a fill step", async () => {
    expect(shouldTrackFill(doc("input", false, "radio"))).toBe(false);
  });
});

describe("shouldTrackKeyPress", () => {
  it("pressing Enter with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Enter", doc("body"))).toBe(true);
  });

  it("pressing Enter with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Enter", doc("input"))).toBe(true);
  });

  it("pressing Enter with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Enter", doc("textarea"))).toBe(false);
  });

  it("pressing Enter with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Enter", doc("div", true))).toBe(false);
  });

  it("pressing Tab with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", doc("body"))).toBe(true);
  });

  it("pressing Tab with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", doc("input"))).toBe(true);
  });

  it("pressing Tab with focus on textarea creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", doc("textarea"))).toBe(true);
  });

  it("pressing Tab with focus on contenteditable element creates a press step", async () => {
    expect(shouldTrackKeyPress("Tab", doc("div", true))).toBe(true);
  });

  it("pressing Escape with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", doc("body"))).toBe(true);
  });

  it("pressing Escape with focus on text input creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", doc("input"))).toBe(true);
  });

  it("pressing Escape with focus on textarea creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", doc("textarea"))).toBe(true);
  });

  it("pressing Escape with focus on contenteditable element creates a press step", async () => {
    expect(shouldTrackKeyPress("Escape", doc("div", true))).toBe(true);
  });

  it("pressing a letter with focus on non-input does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", doc("body"))).toBe(false);
  });

  it("pressing a letter with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", doc("input"))).toBe(false);
  });

  it("pressing a letter with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", doc("textarea"))).toBe(false);
  });

  it("pressing a letter with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("a", doc("div", true))).toBe(false);
  });

  it("pressing Spacebar with focus on non-input does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", doc("body"))).toBe(false);
  });

  it("pressing Spacebar with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", doc("input"))).toBe(false);
  });

  it("pressing Spacebar with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", doc("textarea"))).toBe(false);
  });

  it("pressing Spacebar with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress(" ", doc("div", true))).toBe(false);
  });

  it("pressing ArrowDown with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", doc("body"))).toBe(true);
  });

  it("pressing ArrowDown with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", doc("input"))).toBe(false);
  });

  it("pressing ArrowDown with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", doc("textarea"))).toBe(false);
  });

  it("pressing ArrowDown with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowDown", doc("div", true))).toBe(false);
  });

  it("pressing ArrowLeft with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", doc("body"))).toBe(true);
  });

  it("pressing ArrowLeft with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", doc("input"))).toBe(false);
  });

  it("pressing ArrowLeft with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", doc("textarea"))).toBe(false);
  });

  it("pressing ArrowLeft with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowLeft", doc("div", true))).toBe(false);
  });

  it("pressing ArrowRight with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", doc("body"))).toBe(true);
  });

  it("pressing ArrowRight with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", doc("input"))).toBe(false);
  });

  it("pressing ArrowRight with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", doc("textarea"))).toBe(false);
  });

  it("pressing ArrowRight with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowRight", doc("div", true))).toBe(false);
  });

  it("pressing ArrowUp with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", doc("body"))).toBe(true);
  });

  it("pressing ArrowUp with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", doc("input"))).toBe(false);
  });

  it("pressing ArrowUp with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", doc("textarea"))).toBe(false);
  });

  it("pressing ArrowUp with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("ArrowUp", doc("div", true))).toBe(false);
  });

  it("pressing Backspace with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", doc("body"))).toBe(true);
  });

  it("pressing Backspace with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", doc("input"))).toBe(false);
  });

  it("pressing Backspace with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", doc("textarea"))).toBe(false);
  });

  it("pressing Backspace with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Backspace", doc("div", true))).toBe(false);
  });

  it("pressing Delete with focus on non-input creates a press step", async () => {
    expect(shouldTrackKeyPress("Delete", doc("body"))).toBe(true);
  });

  it("pressing Delete with focus on text input does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", doc("input"))).toBe(false);
  });

  it("pressing Delete with focus on textarea does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", doc("textarea"))).toBe(false);
  });

  it("pressing Delete with focus on contenteditable element does not create a press step", async () => {
    expect(shouldTrackKeyPress("Delete", doc("div", true))).toBe(false);
  });
});
