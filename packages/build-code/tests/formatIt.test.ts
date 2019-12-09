import { Step } from "@qawolf/types";
import { formatDescription, formatIt } from "../src/formatIt";

describe("formatDescription", () => {
  it("formats labels", () => {
    const step: Step = {
      action: "type",
      html: {
        ancestors: [],
        node: {
          attrs: { labels: "name username" },
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
    };

    expect(formatDescription(step)).toBe(' "name username"');
  });

  it("shortens target name if needed", () => {
    const step: Step = {
      action: "click",
      html: {
        ancestors: [],
        node: {
          attrs: { innertext: `sign in${"x".repeat(200)}` },
          name: "input",
          type: "tag",
          voidElement: false
        }
      },
      index: 0,
      page: 0
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

    expect(formatIt(step)).toBe("can click input");
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
      page: 0
    };

    expect(formatIt(step)).toBe('can click "spirit" img');
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
      page: 0,
      value: "↓Enter"
    };

    expect(formatIt(step)).toEqual("can Enter");
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
      page: 0,
      value: "↓Tab"
    };

    expect(formatIt(step)).toEqual("can Tab");
  });
});
