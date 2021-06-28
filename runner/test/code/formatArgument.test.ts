import { formatArgument } from "../../src/code/formatArgument";

describe("formatArgument", () => {
  it("returns an empty string for null", () => {
    expect(formatArgument(null)).toEqual('""');
  });

  it("serializes newlines", () => {
    expect(
      formatArgument(`line 1
line 2`)
    ).toEqual('"line 1\\nline 2"');
  });

  it("uses double quotes by default", () => {
    expect(formatArgument("a")).toBe(`"a"`);
  });

  it("uses single quotes when there are double quotes in the selector", () => {
    expect(formatArgument('"a"')).toBe(`'"a"'`);
  });

  it("uses backtick when there are double and single quotes", () => {
    expect(formatArgument(`text="a" and 'b'`)).toBe("`text=\"a\" and 'b'`");

    // escapes backtick
    expect(formatArgument("text=\"a\" and 'b' and `c`")).toBe(
      "`text=\"a\" and 'b' and \\`c\\``"
    );
  });
});
