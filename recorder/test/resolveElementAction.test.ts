import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import { resolvePress, shouldTrackFill } from "../src/resolveElementAction";
import { Action } from "../src/types";
import { launch, LaunchResult } from "./utils";

describe("resolveElementAction", () => {
  let launched: LaunchResult;
  let page: Page;

  beforeAll(async () => {
    launched = await launch();

    page = launched.page;

    await page.goto(
      "file://" + require.resolve("./fixtures/resolveElementAction.html")
    );
  });

  afterAll(() => launched.browser.close());

  it("returns click with the last received mousedown selector if the target is invisible", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.getElementById("hidden-div") as HTMLInputElement;

      const lastReceivedAction: PossibleAction = {
        action: "mousedown",
        isTrusted: true,
        selector: "#hidden-div",
        target,
        time: Date.now(),
        value: undefined,
      };

      const possibleAction: PossibleAction = {
        action: "click",
        isTrusted: true,
        target,
        time: Date.now(),
        value: undefined,
      };

      return qawolf.resolveElementAction({
        lastReceivedAction,
        possibleAction,
      });
    });

    expect(result).toEqual({ action: "click", selector: "#hidden-div" });
  });

  it("returns fill for fill action on an input", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector(".textInput") as HTMLInputElement;

      const possibleAction: PossibleAction = {
        action: "fill",
        isTrusted: true,
        target,
        time: Date.now(),
        value: qawolf.getInputElementValue(target),
      };

      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toEqual({ action: "fill" });
  });

  it("returns keyboard.press on invisible targets", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const target = document.getElementById("hidden-div") as HTMLElement;

      const possibleAction: PossibleAction = {
        action: "press",
        isTrusted: true,
        target,
        time: Date.now(),
        value: "Escape",
      };
      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toEqual({ action: "keyboard.press" });
  });

  it("returns selectOption for fill action on a select", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const possibleAction: PossibleAction = {
        action: "fill",
        isTrusted: true,
        target,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toEqual({ action: "selectOption" });
  });

  it("returns undefined for actions on invisible targets", async () => {
    // the exception is for keyboard.press
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector('[type="hidden"]') as HTMLElement;

      const possibleAction: PossibleAction = {
        action: "press",
        isTrusted: true,
        target,
        time: Date.now(),
        value: "Enter",
      };

      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for duplicate select", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const target = document.querySelector("select") as HTMLElement;

      const possibleAction: PossibleAction = {
        action: "selectOption",
        isTrusted: true,
        target,
        time: Date.now(),
        value: "value",
      };

      return qawolf.resolveElementAction({
        lastReceivedAction: possibleAction,
        possibleAction,
      });
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for untrusted actions", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      const possibleAction: PossibleAction = {
        action: "click",
        isTrusted: false,
        target: null,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toBe(undefined);
  });

  it.each<Action>(["fill", "press"])(
    "returns undefined for clicks immediately after %s actions",
    async (previousActionName) => {
      const result = await page.evaluate(
        ({ previousActionName }) => {
          const qawolf: QAWolfWeb = (window as any).qawolf;
          const target = document.querySelector("body");

          const lastReceivedAction: PossibleAction = {
            action: previousActionName,
            isTrusted: true,
            target,
            time: 10002000,
            value: null,
          };

          const possibleAction: PossibleAction = {
            action: "click",
            isTrusted: true,
            target,
            time: 10002040,
            value: null,
          };

          return qawolf.resolveElementAction({
            lastReceivedAction,
            possibleAction,
          });
        },
        { previousActionName }
      );

      expect(result).toBe(undefined);
    }
  );

  it("returns undefined for clicks on selects", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const possibleAction: PossibleAction = {
        action: "click",
        isTrusted: true,
        target,
        time: Date.now(),
        value: null,
      };

      return qawolf.resolveElementAction({ possibleAction });
    });

    expect(result).toBe(undefined);
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
