import { CONFIG } from "@qawolf/config";
import { QAWolfWeb } from "@qawolf/web";
import { Browser } from "../src/Browser";
import { getDevice } from "../src/Browser/device";

describe("Browser.create", () => {
  it("injects qawolf", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });

    const isLoaded = () => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    };

    const pageZero = await browser.page(0);
    const zeroIsLoaded = await pageZero.evaluate(isLoaded);
    expect(zeroIsLoaded).toBeTruthy();

    // check it loads on a new page
    await browser.newPage();
    const pageOne = await browser.page(1);
    const oneIsLoaded = await pageOne.evaluate(isLoaded);
    expect(oneIsLoaded).toBeTruthy();

    await browser.close();
  });

  it("emulates device", async () => {
    const browser = await Browser.create({
      size: "mobile",
      url: CONFIG.testUrl
    });

    const expectedViewport = getDevice("mobile").viewport;
    expect((await browser.page(0)).viewport()).toEqual(expectedViewport);

    // check it emulates on a new page
    await browser.newPage();
    expect((await browser.page(1)).viewport()).toEqual(expectedViewport);

    await browser.close();
  });
});

describe("Browser.page", () => {
  it("chooses the first open page if the current page is closed", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });

    const pageOne = await browser.newPage();

    // change the current page to 1
    await browser.page(1);
    let currentPage = await browser.page();
    expect(currentPage).toEqual(pageOne);

    await pageOne.close();

    currentPage = await browser.page();
    expect(currentPage).not.toEqual(pageOne);

    await browser.close();
  });
});

describe("Browser.find", () => {
  it("finds an element", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });

    const elementHandle = await browser.find({ css: "#login > button" });
    expect(elementHandle).toBeTruthy();
    expect(
      await elementHandle!.evaluate(e => (e as HTMLButtonElement).type)
    ).toBe("submit");

    await browser.close();
  });
});
