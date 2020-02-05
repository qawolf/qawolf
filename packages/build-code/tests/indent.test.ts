import { getIndentation, indent } from "../src/indent";

describe("getIndentation", () => {
  it("works for one line", () => {
    const indentation = getIndentation("   mySearch", "mySearch");
    expect(indentation).toEqual(3);
  });

  it("works for multi-line", () => {
    const indentation = getIndentation(
      `a bunch of stuff here

    mySearch`,
      "mySearch"
    );

    expect(indentation).toEqual(4);
  });
});

describe("indent", () => {
  it("works for one line", () => {
    const indentation = indent("mySearch", 3);
    expect(indentation).toEqual("   mySearch");
  });

  it("works for multi-line", () => {
    const indentation = indent(
      `1
2
3abc  de `,
      2
    );
    expect(indentation).toEqual("  1\n  2\n  3abc  de ");
  });
});
