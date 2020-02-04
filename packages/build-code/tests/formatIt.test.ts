import { Step } from "@qawolf/types";
import { formatIt } from "../src/formatIt";

describe("formatIt", () => {
  it("excludes target name if it does not exist", () => {
    const step: Step = {
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

    expect(formatIt(step)).toBe("click input");
  });

  it("uses alt attribute if no other attributes specified", () => {
    const step: Step = {
      action: "click",
      html: {
        ancestors: [],
        node: {
          attrs: {
            alt: "spirit"
          },
          name: "img",
          type: "tag"
        }
      },
      index: 0,
      isFinal: true,
      page: 0
    };

    expect(formatIt(step)).toBe('click "spirit" img');
  });

  it("formats Enter", () => {
    const step: Step = {
      action: "type",
      html: {
        ancestors: [],
        node: {
          name: "input",
          type: "tag"
        }
      },
      index: 0,
      isFinal: true,
      page: 0,
      value: "↓Enter"
    };

    expect(formatIt(step)).toEqual("Enter");
  });

  it("formats Tab", () => {
    const step: Step = {
      action: "type",
      html: {
        ancestors: [],
        node: {
          name: "input",
          type: "tag"
        }
      },
      index: 0,
      isFinal: true,
      page: 0,
      value: "↓Tab"
    };

    expect(formatIt(step)).toEqual("Tab");
  });
});
