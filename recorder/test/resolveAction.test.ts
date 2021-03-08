import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import { resolvePress, shouldTrackFill } from "../src/resolveAction";
import { Action, PossibleAction } from "../src/types";
import { launch, LaunchResult } from "./utils";

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
        isTrusted: true,
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
        action: "press",
        isTrusted: true,
        target,
        time: Date.now(),
        value: "Enter",
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe(undefined);
  });

  it("returns keyboard.press for actions on invisible targets", async () => {
    const page = await getFreshPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("html") as HTMLElement;

      const mockAction: PossibleAction = {
        action: "press",
        isTrusted: true,
        target,
        time: Date.now(),
        value: "Escape",
      };

      return qawolf.resolveAction(mockAction, undefined);
    });

    expect(result).toBe("keyboard.press");
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

describe("fill and press helpers", () => {
  const descriptor = (
    tag: string,
    isContentEditable = false,
    inputType?: string
  ): ElementDescriptor => ({
    isContentEditable,
    inputType,
    tag,
  });

  describe("resolvePress", () => {
    it("pressing Arrow/Escape/Delete/Tab for non-inputs creates a keyboard.press step", () => {
      ["ArrowLeft", "Delete", "Enter", "Escape", "Tab"].forEach((key) => {
        expect(resolvePress(key, descriptor("html"))).toBe("keyboard.press");
      });
    });

    it("pressing Arrow keys in an input or text area does not create a press step", () => {
      ["input", "textarea"].forEach((tag) => {
        expect(resolvePress("ArrowLeft", descriptor(tag))).toBe(null);
      });
    });

    it("pressing Enter/Escape/Tab in an input creates a press step", () => {
      ["Enter", "Escape", "Tab"].forEach((key) => {
        expect(resolvePress(key, descriptor("input"))).toBe("press");
      });
    });

    it("pressing Escape/Tab in a textarea creates a press step", () => {
      ["Escape", "Tab"].forEach((key) => {
        expect(resolvePress(key, descriptor("input"))).toBe("press");
      });
    });

    it("pressing Escape/Tab in a contenteditable creates a press step", () => {
      ["Escape", "Tab"].forEach((key) => {
        expect(resolvePress(key, descriptor("div", true))).toBe("press");
      });
    });
  });

  describe("shouldTrackFill", () => {
    it("clicking a checkbox/radio or picking a file inputs does not create a fill step", () => {
      ["checkbox", "radio", "file"].forEach((type) => {
        expect(shouldTrackFill(descriptor("input", false, type))).toBe(false);
      });
    });

    it("typing into inputs/textarea creates a fill step", () => {
      ["input", "textarea"].forEach((tag) => {
        expect(shouldTrackFill(descriptor(tag))).toBe(true);
      });
    });

    it("typing into a content editable creates a fill step", () => {
      expect(shouldTrackFill(descriptor("div", true))).toBe(true);
    });

    it("typing into a non-content editable, non-input does not create a fill step", () => {
      expect(shouldTrackFill(descriptor("div"))).toBe(false);
    });
  });
});
