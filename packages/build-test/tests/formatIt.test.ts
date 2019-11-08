import { Step } from "@qawolf/types";
import { formatTarget, formatIt } from "../src/formatIt";

describe("formatTarget", () => {
  it("formats labels", () => {
    const step: Step = {
      action: "type",
      index: 0,
      target: {
        labels: ["name", "username"],
        name: "other",
        tagName: "input"
      }
    };

    expect(formatTarget(step)).toBe('"name username" input');
  });

  it("excludes target name if it does not exist", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        inputType: "submit",
        tagName: "input"
      }
    };

    expect(formatTarget(step)).toBe("input");
  });

  it("shortens target name if needed", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        inputType: "submit",
        tagName: "input",
        innerText: `sign in${"x".repeat(200)}`
      }
    };

    expect(formatTarget(step)).toBe(
      '"sign inxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..." input'
    );
  });
});

describe("formatIt", () => {
  it("formats Enter", () => {
    const step: Step = {
      action: "type",
      index: 0,
      target: {
        inputType: "text"
      },
      value: "↓Enter"
    };

    expect(formatIt(step)).toEqual("can Enter");
  });

  it("formats Tab", () => {
    const step: Step = {
      action: "type",
      index: 0,
      target: {
        inputType: "text"
      },
      value: "↓Tab"
    };

    expect(formatIt(step)).toEqual("can Tab");
  });
});
