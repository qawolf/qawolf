import { Browser } from "./Browser";
import { CONFIG } from "../config";
import { getDevice } from "./device";
import { QAWolf } from "../web";

test("Browser.create injects qawolf", async () => {
  const browser = await Browser.create(CONFIG.testUrl);

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
  const browser = await Browser.create(CONFIG.testUrl, "mobile");

  const expectedViewport = getDevice("mobile").viewport;
  expect((await browser.page(0)).viewport()).toEqual(expectedViewport);

  // check it emulates on a new page
  await browser._browser.newPage();
  expect((await browser.page(1)).viewport()).toEqual(expectedViewport);

  await browser.close();
});
