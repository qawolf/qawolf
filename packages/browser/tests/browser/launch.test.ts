import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { getDevice } from "../../src/browser/device";
import { launch } from "../../src/browser/launch";

describe("launch", () => {
  it("injects qawolf", async () => {
    const browser = await launch({ url: CONFIG.testUrl });

    const isLoaded = () => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    };

    const pageZero = await browser.page({ page: 0 });
    const zeroIsLoaded = await pageZero.evaluate(isLoaded);
    expect(zeroIsLoaded).toBeTruthy();

    // check it loads on a new page
    await browser.newPage();
    const pageOne = await browser.page({ page: 1 });
    const oneIsLoaded = await pageOne.evaluate(isLoaded);
    expect(oneIsLoaded).toBeTruthy();

    await browser.close();
  });

  it("emulates device", async () => {
    const browser = await launch({
      device: "iPhone 7",
      url: CONFIG.testUrl
    });

    const expectedViewport = getDevice("iPhone 7").viewport;
    expect((await browser.page({ page: 0 })).viewport()).toEqual(
      expectedViewport
    );

    // check it emulates on a new page
    await browser.newPage();
    expect((await browser.page({ page: 1 })).viewport()).toEqual(
      expectedViewport
    );

    await browser.close();
  });
});
