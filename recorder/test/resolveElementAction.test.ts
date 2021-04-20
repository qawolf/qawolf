import { Page } from "playwright";

import { QAWolfWeb } from "../src";
import { ElementDescriptor } from "../src/element";
import {
  resolveEventAction,
  resolvePress,
  shouldTrackFill,
} from "../src/resolveElementAction";
import { launch, LaunchResult } from "./utils";

describe("resolveEventAction", () => {
  it("returns click for click", async () => {
    expect(resolveEventAction("click", "A")).toEqual("click");
  });

  it("returns fill for change/input on an input", async () => {
    expect(resolveEventAction("change", "INPUT")).toEqual("fill");
    expect(resolveEventAction("input", "INPUT")).toEqual("fill");
  });

  it("returns press for keydown", async () => {
    expect(resolveEventAction("keydown", "HTML")).toEqual("press");
  });

  it("returns selectOption for change/input on a select", async () => {
    expect(resolveEventAction("change", "SELECT")).toEqual("selectOption");
    expect(resolveEventAction("input", "SELECT")).toEqual("selectOption");
  });

  it("returns undefined for click on a select", async () => {
    expect(resolveEventAction("click", "SELECT")).toEqual(undefined);
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
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            isTrusted: true,
            target: document.getElementById("hidden-div"),
            time: Date.now(),
            type: "keydown",
            value: "Escape",
          },
        ])
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
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          { isTrusted: true, target, type: "click", time: Date.now() },
          {
            isTrusted: true,
            selector: "#hidden-div",
            target,
            time: Date.now(),
            type: "mousedown",
          },
        ])
      );
    });

    expect(result).toEqual({
      action: "click",
      selector: "#hidden-div",
      time: expect.any(Number),
    });
  });

  it("returns undefined for actions on invisible targets", async () => {
    // the exception is for keyboard.press
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector('[type="hidden"]') as HTMLElement;

      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            isTrusted: true,
            target,
            time: Date.now(),
            type: "click",
            value: "Enter",
          },
        ])
      );
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for duplicate select", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      const target = document.querySelector("select");

      const event = {
        isTrusted: true,
        target,
        time: Date.now(),
        type: "change",
        value: "value",
      };

      return qawolf.resolveElementAction(
        new qawolf.EventSequence([event, event])
      );
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for untrusted actions", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            isTrusted: false,
            target: document.querySelector("body"),
            time: Date.now(),
            type: "click",
            value: null,
          },
        ])
      );
    });

    expect(result).toBe(undefined);
  });

  it("returns undefined for clicks without a mousedown", async () => {
    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return qawolf.resolveElementAction(
        new qawolf.EventSequence([
          {
            isTrusted: false,
            target: document.querySelector("body"),
            time: Date.now(),
            type: "click",
            value: null,
          },
        ])
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
