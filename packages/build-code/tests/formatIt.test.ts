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

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: null
    };

    expect(formatIt(step)).toEqual("clear input");
  });

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "something"
    };

    expect(formatIt(step)).toEqual("type into input");
  });

  it("formats scroll action", () => {
    const step: Step = {
      ...baseStep,
      action: "scroll"
    };

    expect(formatIt(step)).toBe("scroll");
  });

  it("formats select action", () => {
    const step: Step = {
      ...baseStep,
      action: "select"
    };

    expect(formatIt(step)).toBe("select");
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
