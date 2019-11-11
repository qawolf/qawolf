import { Step } from "@qawolf/types";
import { formatDescription, formatIt } from "../src/formatIt";

describe("formatDescription", () => {
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

    expect(formatDescription(step)).toBe(' "name username"');
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

    expect(formatDescription(step)).toBe(
      ' "sign inxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."'
    );
  });
});

describe("formatIt", () => {
  it("excludes target name if it does not exist", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        inputType: "submit",
        tagName: "input"
      }
    };

    expect(formatIt(step)).toBe("can click input");
  });

  it("uses alt attribute if no other attributes specified", () => {
    const step: Step = {
      action: "click",
      index: 0,
      target: {
        alt: "spirit",
        tagName: "img"
      }
    };

    expect(formatIt(step)).toBe('can click "spirit" img');
  });

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
