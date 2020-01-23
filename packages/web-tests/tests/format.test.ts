import { DocSelector } from "@qawolf/types";
import { describeDoc } from "@qawolf/web";

describe("describeDoc", () => {
  it("formats labels", () => {
    expect(
      describeDoc({
        ancestors: [],
        node: {
          attrs: { labels: "name username" },
          name: "input",
          type: "tag",
          voidElement: false
        }
      })
    ).toBe(' "name username"');
  });

  it("shortens target name if needed", () => {
    expect(
      describeDoc({
        ancestors: [],
        node: {
          attrs: { innertext: `sign in${"x".repeat(200)}` },
          name: "input",
          type: "tag",
          voidElement: false
        }
      })
    ).toBe(' "sign inxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."');
  });

  it("escapes single quotes", () => {
    expect(
      describeDoc({
        ancestors: [],
        node: {
          attrs: { labels: "someone's" },
          name: "input",
          type: "tag",
          voidElement: false
        }
      })
    ).toBe(` "someones"`);
  });
});
