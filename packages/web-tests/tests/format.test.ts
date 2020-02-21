import { describeDoc } from "@qawolf/web";

const doc = (attrs: object) => ({
  ancestors: [],
  node: {
    attrs,
    name: "input",
    type: "tag",
    voidElement: false
  }
});

describe("describeDoc", () => {
  it("formats labels", () => {
    expect(describeDoc(doc({ labels: "name username" }))).toBe(
      ' "name username"'
    );
  });

  it("shortens target name if needed", () => {
    expect(describeDoc(doc({ innertext: `sign in${"x".repeat(200)}` }))).toBe(
      ' "sign inxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."'
    );
  });

  it("escapes single quotes", () => {
    expect(describeDoc(doc({ labels: "someone's" }))).toBe(` "someones"`);

    expect(describeDoc(doc({ labels: "'" }))).toBe("");
  });

  it("removes invisible characters", () => {
    expect(describeDoc(doc({ labels: "​" }))).toBe("");
  });
});
