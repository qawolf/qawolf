import { Step } from "@qawolf/types";
import { formatIt } from "../src/formatIt";

let baseStep: Step = {
  action: "click",
  html: {
    ancestors: [],
    node: {
      name: "input",
      type: "tag"
    }
  },
  index: 0,
  isFinal: true,
  page: 0
};

describe("formatIt", () => {
  it("excludes target name if it does not exist", () => {
    expect(formatIt(baseStep)).toBe("click input");
  });

  it("uses alt attribute if no other attributes specified", () => {
    const step: Step = {
      ...baseStep,
      html: {
        ancestors: [],
        node: {
          attrs: {
            alt: "spirit"
          },
          name: "img",
          type: "tag"
        }
      }
    };

    expect(formatIt(step)).toBe('click "spirit" img');
  });

  it("formats Enter", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Enter"
    };

    expect(formatIt(step)).toEqual("Enter");
  });

  it("formats Tab", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Tab"
    };

    expect(formatIt(step)).toEqual("Tab");
  });
});
