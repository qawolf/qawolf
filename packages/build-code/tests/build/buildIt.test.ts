import { Step } from "@qawolf/types";
import { buildIt } from "../../src/build";

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

describe("buildIt", () => {
  it("excludes target name if it does not exist", () => {
    expect(buildIt(baseStep)).toBe("click input");
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

    expect(buildIt(step)).toBe('click "spirit" img');
  });

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: null
    };

    expect(buildIt(step)).toEqual("clear input");
  });

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "something"
    };

    expect(buildIt(step)).toEqual("type into input");
  });

  it("formats scroll action", () => {
    const step: Step = {
      ...baseStep,
      action: "scroll"
    };

    expect(buildIt(step)).toBe("scroll");
  });

  it("formats select action", () => {
    const step: Step = {
      ...baseStep,
      action: "select"
    };

    expect(buildIt(step)).toBe("select");
  });

  it("formats Enter", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Enter"
    };

    expect(buildIt(step)).toEqual("Enter");
  });

  it("formats Tab", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Tab"
    };

    expect(buildIt(step)).toEqual("Tab");
  });
});
