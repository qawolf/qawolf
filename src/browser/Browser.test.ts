import { Browser, $xText } from "./Browser";
import { CONFIG } from "../config";
import { getDevice } from "./device";
import { QAWolf } from "../web";

test("Browser.create injects qawolf", async () => {
  const browser = await Browser.create({ url: CONFIG.testUrl });

  const isLoaded = () => {
    const qawolf: QAWolf = (window as any).qawolf;
    return !!qawolf;
  };

  const zeroIsLoaded = await (await browser.page(0)).evaluate(isLoaded);
  expect(zeroIsLoaded).toBeTruthy();

  // check it loads on a new page
  await browser._browser.newPage();
  const oneIsLoaded = await (await browser.page(1)).evaluate(isLoaded);
  expect(oneIsLoaded).toBeTruthy();

  await browser.close();
});

test("Browser.create emulates device", async () => {
  const browser = await Browser.create({ size: "mobile", url: CONFIG.testUrl });

  const expectedViewport = getDevice("mobile").viewport;
  expect((await browser.page(0)).viewport()).toEqual(expectedViewport);

  // check it emulates on a new page
  await browser._browser.newPage();
  expect((await browser.page(1)).viewport()).toEqual(expectedViewport);

  await browser.close();
});

describe.only("Browser.runStep", () => {
  test("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.page();

    await browser.runStep({
      action: "click",
      locator: { xpath: '//*[@id="content"]/ul/li[3]/a' }
    });

    await page.waitForNavigation();

    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });

  test("clicks on icon in button", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.page();

    const messageText = await $xText(page, '//*[@id="flash-messages"]');
    expect(messageText).not.toContain("username is invalid");

    await browser.runStep({
      action: "click",
      locator: { tagName: "i" }
    });

    const messageText2 = await $xText(page, '//*[@id="flash"]');
    expect(messageText2).toContain("username is invalid");

    await browser.close();
  });

  // test.only("scrolls to given position", async () => {});

  // test("selects option in select", async () => {})
});
