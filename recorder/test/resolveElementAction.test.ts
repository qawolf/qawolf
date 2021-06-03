import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import {
  resolveAction,
  resolvePress,
  shouldTrackFill,
} from "../src/resolveElementAction";
import { launch, LaunchResult } from "./utils";
import { RankedSelector } from '../src/types';

const mockDescriptor = (tag: string, others: Partial<ElementDescriptor> = {}): ElementDescriptor => {
  return {
    isContentEditable: false,
    tag,
    ...others
  };
}

describe("resolveAction", () => {
  it("returns click for click", async () => {
    expect(resolveAction("click", mockDescriptor("a"))).toEqual("click");
  });

  it("returns fill for change/input on an input", async () => {
    expect(resolveAction("change", mockDescriptor("input"))).toEqual("fill");
    expect(resolveAction("input", mockDescriptor("input"))).toEqual("fill");
  });

  it("returns check for change/input on a checkbox input that is checked and visible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: true }), true)).toEqual("check");
    expect(resolveAction("input", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: true }), true)).toEqual("check");
  });

  it("returns undefined for change/input on a checkbox input that is checked and invisible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: true }), false)).toBe(undefined);
    expect(resolveAction("input", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: true }), false)).toBe(undefined);
  });

  it("returns check for change/input on a radio input that is checked and visible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "radio", inputIsChecked: true }), true)).toEqual("check");
    expect(resolveAction("input", mockDescriptor("input", { inputType: "radio", inputIsChecked: true }), true)).toEqual("check");
  });

  it("returns undefined for change/input on a radio input that is checked and invisible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "radio", inputIsChecked: true }), false)).toBe(undefined);
    expect(resolveAction("input", mockDescriptor("input", { inputType: "radio", inputIsChecked: true }), false)).toBe(undefined);
  });

  it("returns uncheck for change/input on a checkbox input that is unchecked and visible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: false }), true)).toEqual("uncheck");
    expect(resolveAction("input", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: false }), true)).toEqual("uncheck");
  });

  it("returns undefined for change/input on a checkbox input that is unchecked and invisible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: false }), false)).toBe(undefined);
    expect(resolveAction("input", mockDescriptor("input", { inputType: "checkbox", inputIsChecked: false }), false)).toBe(undefined);
  });

  it("returns uncheck for change/input on a radio input that is unchecked and visible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "radio", inputIsChecked: false }), true)).toEqual("uncheck");
    expect(resolveAction("input", mockDescriptor("input", { inputType: "radio", inputIsChecked: false }), true)).toEqual("uncheck");
  });

  it("returns undefined for change/input on a radio input that is unchecked and invisible", async () => {
    expect(resolveAction("change", mockDescriptor("input", { inputType: "radio", inputIsChecked: false }), false)).toBe(undefined);
    expect(resolveAction("input", mockDescriptor("input", { inputType: "radio", inputIsChecked: false }), false)).toBe(undefined);
  });

  it("returns press for keydown", async () => {
    expect(resolveAction("keydown", mockDescriptor("html"))).toEqual("press");
  });

  it("returns selectOption for change/input on a select", async () => {
    expect(resolveAction("change", mockDescriptor("select"))).toEqual("selectOption");
    expect(resolveAction("input", mockDescriptor("select"))).toEqual("selectOption");
  });

  it("returns undefined for click on a select", async () => {
    expect(resolveAction("click", mockDescriptor("select"))).toEqual(undefined);
  });
});

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

  it("returns keyboard.press on invisible targets", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const selectorCache = new Map<HTMLElement, RankedSelector>()
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            eventTimeStamp: Date.now(),
            isTrusted: true,
            target: document.getElementById("hidden-div"),
            time: Date.now(),
            type: "keydown",
            value: "Escape",
          },
        ]),
        selectorCache
      );
    });

    expect(result).toEqual({
      action: "keyboard.press",
      selector: "",
      time: expect.any(Number),
      value: "Escape",
    });
  });

  it("returns click with the last received mousedown selector if the target is invisible", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.getElementById("hidden-div");
      const selectorCache = new Map<HTMLElement, RankedSelector>()
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          { eventTimeStamp: Date.now(), isTrusted: true, target, type: "click", time: Date.now() },
          {
            eventTimeStamp: Date.now(), 
            isTrusted: true,
            selector: "#hidden-div",
            target,
            time: Date.now(),
            type: "mousedown",
          },
        ]),
        selectorCache
      );
    });

    expect(result).toEqual({
      action: "click",
      selector: "#hidden-div",
      time: expect.any(Number),
    });
  });

  it("returns undefined for actions on invisible targets", async () => {
    // (except for keyboard.press)
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector('[type="hidden"]') as HTMLElement;

      const invisibleClick = {
        eventTimeStamp: Date.now(),
        isTrusted: true,
        target,
        time: Date.now(),
        type: "click",
      };

      const selectorCache = new Map<HTMLElement, RankedSelector>()

      return [
        qawolf.resolveElementAction(new qawolf.EventSequence([invisibleClick]), selectorCache),
        qawolf.resolveElementAction(
          new qawolf.EventSequence([
            { ...invisibleClick, type: "change", value: "value" },
          ]),
          selectorCache
        ),
      ];
    });

    expect(result).toEqual([undefined, undefined]);
  });

  it("returns undefined for duplicate select", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const event = {
        eventTimeStamp: Date.now(),
        isTrusted: true,
        target,
        time: Date.now(),
        type: "change",
        value: "value",
      };

      const selectorCache = new Map<HTMLElement, RankedSelector>()

      return qawolf.resolveElementAction(
        new qawolf.EventSequence([event, event]),
        selectorCache
      );
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for untrusted actions", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const selectorCache = new Map<HTMLElement, RankedSelector>()
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            eventTimeStamp: Date.now(),
            isTrusted: false,
            target: document.querySelector("body"),
            time: Date.now(),
            type: "click",
            value: null,
          },
        ]),
        selectorCache
      );
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for clicks without a mousedown", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const selectorCache = new Map<HTMLElement, RankedSelector>()
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            eventTimeStamp: Date.now(),
            isTrusted: false,
            target: document.querySelector("body"),
            time: Date.now(),
            type: "click",
            value: null,
          },
        ]),
        selectorCache
      );
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
    it("picking a file does not create a fill step", () => {
      expect(shouldTrackFill(descriptor("input", false, "file"))).toBe(false);
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
