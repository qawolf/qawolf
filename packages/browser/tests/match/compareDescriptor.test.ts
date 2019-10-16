import { compareDescriptors } from "@qawolf/web";

describe("compareDescriptors", () => {
  it("returns list of matches between target and compare", () => {
    expect(
      compareDescriptors(
        {
          id: "spirit",
          labels: ["spirit", "wolf"],
          tagName: "div",
          textContent: "spirit"
        },
        { id: "bobcat", labels: ["spirit"], tagName: "div" }
      )
    ).toEqual([
      { key: "labels", percent: 50 },
      { key: "tagName", percent: 100 }
    ]);
  });

  it("returns empty array if no matches", () => {
    expect(
      compareDescriptors(
        {
          id: "spirit",
          labels: ["spirit"],
          textContent: "spirit"
        },
        { id: "bobcat", labels: ["bobcat"], tagName: "div" }
      )
    ).toEqual([]);
  });
});
