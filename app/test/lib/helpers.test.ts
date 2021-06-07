import { formatBill, isValidURL, parseUrl } from "../../lib/helpers";
import { TeamWithUsers } from "../../lib/types";

describe("formatBill", () => {
  it("returns empty string if not on business plan", () => {
    expect(
      formatBill(
        {
          base_price: null,
          metered_price: null,
          plan: "free",
        } as TeamWithUsers,
        5
      )
    ).toBe("");
  });

  it("returns base price if run count < 1000", () => {
    expect(
      formatBill(
        {
          base_price: 119,
          metered_price: 49,
          plan: "business",
        } as TeamWithUsers,
        5
      )
    ).toMatch("$119");
  });

  it("returns base price plus metered price if run count > 1000", () => {
    expect(
      formatBill(
        {
          base_price: 119,
          metered_price: 49,
          plan: "business",
        } as TeamWithUsers,
        1001
      )
    ).toMatch("$168");

    expect(
      formatBill(
        {
          base_price: 119,
          metered_price: 49,
          plan: "business",
        } as TeamWithUsers,
        1501
      )
    ).toMatch("$217");
  });
});

describe("isValidURL", () => {
  it("returns true if URL is valid", () => {
    expect(isValidURL("https://news.ycombinator.com/")).toBe(true);
    expect(isValidURL("http://localhost:3000")).toBe(true);
    expect(isValidURL("http://en.wikipedia.org/wiki/Template:Welcome")).toBe(
      true
    );
  });

  it("returns false if URL is not valid", () => {
    expect(isValidURL("invalid")).toBe(false);
    expect(isValidURL("javascript:void(0)")).toBe(false);
    expect(isValidURL("www.example.com")).toBe(false);
    expect(isValidURL("https://login")).toBe(false);
  });
});

describe("parseUrl", () => {
  it("returns URL if protocol included", () => {
    expect(parseUrl("https://news.ycombinator.com")).toBe(
      "https://news.ycombinator.com"
    );
  });

  it("adds protocol if not included", () => {
    expect(parseUrl("localhost:3000")).toBe("http://localhost:3000");
    expect(parseUrl("news.ycombinator.com")).toBe(
      "https://news.ycombinator.com"
    );
  });
});
