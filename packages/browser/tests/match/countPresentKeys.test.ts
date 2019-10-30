import { countPresentKeys } from "@qawolf/web";

describe("countPresentKeys", () => {
  it("returns number of non-null keys in descriptor", () => {
    expect(
      countPresentKeys({
        dataValue: undefined,
        innerText: null,
        inputType: "text",
        labels: ["username"],
        placeholder: null,
        tagName: "input"
      })
    ).toBe(3);
  });

  it("throws error if all keys have no value", () => {
    expect(() => {
      countPresentKeys({ dataValue: undefined, innerText: null });
    }).toThrowError();

    expect(() => {
      countPresentKeys({});
    }).toThrowError();
  });
});
