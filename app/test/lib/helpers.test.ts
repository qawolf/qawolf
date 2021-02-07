import { isValidURL, parseUrl } from "../../lib/helpers";

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
