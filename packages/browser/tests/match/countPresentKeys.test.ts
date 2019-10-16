import { countPresentKeys } from "@qawolf/web";

describe("countPresentKeys", () => {
  it("returns number of non-null keys in descriptor", () => {
    expect(
      countPresentKeys({
        dataValue: undefined,
        inputType: "text",
        labels: ["username"],
        placeholder: null,
        tagName: "input",
        textContent: null
      })
    ).toBe(3);
  });

  it("throws error if all keys have no value", () => {
    expect(() => {
      countPresentKeys({ dataValue: undefined, textContent: null });
    }).toThrowError();

    expect(() => {
      countPresentKeys({});
    }).toThrowError();
  });
});
