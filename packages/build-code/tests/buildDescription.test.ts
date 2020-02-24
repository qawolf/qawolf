import { Step } from "@qawolf/types";
import { buildDescription } from "../src/buildDescription";

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
  page: 0
};

describe("buildDescription", () => {
  it("excludes target name if it does not exist", () => {
    expect(buildDescription(baseStep)).toBe("click input");
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

    expect(buildDescription(step)).toBe('click "spirit" img');
  });

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      replace: true,
      value: null
    };

    expect(buildDescription(step)).toEqual("clear input");
  });

  it("formats clear input", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "something"
    };

    expect(buildDescription(step)).toEqual("type into input");
  });

  it("formats scroll action", () => {
    const step: Step = {
      ...baseStep,
      action: "scroll"
    };

    expect(buildDescription(step)).toBe("scroll");
  });

  it("formats select action", () => {
    const step: Step = {
      ...baseStep,
      action: "select"
    };

    expect(buildDescription(step)).toBe("select");
  });

  it("formats Enter", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Enter"
    };

    expect(buildDescription(step)).toEqual("Enter");
  });

  it("formats Tab", () => {
    const step: Step = {
      ...baseStep,
      action: "type",
      value: "↓Tab"
    };

    expect(buildDescription(step)).toEqual("Tab");
  });
});
