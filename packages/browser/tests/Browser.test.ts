import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Browser } from "../src/Browser";
import { getDevice } from "../src/device";

describe("Browser.create", () => {
  it("injects qawolf", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });

    const isLoaded = () => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    };

    const zeroIsLoaded = await (await browser.getPage(0)).evaluate(isLoaded);
    expect(zeroIsLoaded).toBeTruthy();

    // check it loads on a new page
    await browser.super.newPage();
    const oneIsLoaded = await (await browser.getPage(1)).evaluate(isLoaded);
    expect(oneIsLoaded).toBeTruthy();

    await browser.close();
  });

  it("emulates device", async () => {
    const browser = await Browser.create({
      size: "mobile",
      url: CONFIG.testUrl
    });

    const expectedViewport = getDevice("mobile").viewport;
    expect((await browser.getPage(0)).viewport()).toEqual(expectedViewport);

    // check it emulates on a new page
    await browser.super.newPage();
    expect((await browser.getPage(1)).viewport()).toEqual(expectedViewport);

    await browser.close();
  });
});

describe("Browser.findElement", () => {
  it("finds an element", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });

    const elementHandle = await browser.find("#login > button");
    expect(elementHandle).toBeTruthy();
    expect(
      await elementHandle!.evaluate(e => (e as HTMLButtonElement).type)
    ).toBe("submit");

    await browser.close();
  });
});
