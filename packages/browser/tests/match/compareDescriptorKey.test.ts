import { CONFIG } from "@qawolf/config";
import { compareDescriptorKey, QAWolfWeb } from "@qawolf/web";
import { Browser } from "../../src/Browser";

describe("compareDescriptorKey", () => {
  it("returns 0 if either value is falsy", () => {
    expect(compareDescriptorKey("id", null, "spirit")).toEqual({
      key: "id",
      percent: 0
    });
    expect(compareDescriptorKey("id", "spirit", null)).toEqual({
      key: "id",
      percent: 0
    });
  });

  it("returns 0 if different xpaths", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const result = await page.evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;

      return qawolf.match.compareDescriptorKey(
        "xpath",
        "//*[@id='username']",
        "//*[@id='password']"
      );
    });

    expect(result).toEqual({ key: "xpath", percent: 0 });

    await browser.close();
  });

  it("returns 100 if same xpaths", () => {
    expect(
      compareDescriptorKey(
        "xpath",
        "//*[@id='password']",
        "//*[@id='password']"
      )
    ).toEqual({ key: "xpath", percent: 100 });
  });

  it("returns share of base items in compare if arrays", () => {
    expect(
      compareDescriptorKey("labels", ["spirit", "bobcat"], ["spirit", "bear"])
    ).toEqual({ key: "labels", percent: 50 });
  });

  it("returns 0 if strings not equal", () => {
    expect(compareDescriptorKey("id", "spirit", "bobcat")).toEqual({
      key: "id",
      percent: 0
    });
  });

  it("returns 100 if strings equal", () => {
    expect(compareDescriptorKey("id", "spirit", "spirit")).toEqual({
      key: "id",
      percent: 100
    });
  });
});
