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

describe("Browser.runStep", () => {
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

  test("scrolls to given position", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}large` });
    const page = await browser.page();

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await browser.runStep({
      action: "scroll",
      locator: { xpath: "scroll" },
      scrollTo: 1000
    });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await browser.runStep({
      action: "scroll",
      locator: { xpath: "scroll" },
      scrollTo: 0
    });

    const finalYPosition = await page.evaluate(() => window.pageYOffset);
    expect(finalYPosition).toBe(0);

    await browser.close();
  });

  test("scrolls in infinite scroll", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}infinite_scroll`
    });
    const page = await browser.page();

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await browser.runStep({
      action: "scroll",
      locator: { xpath: "scroll" },
      scrollTo: 2000
    });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(2000);

    await browser.close();
  });

  test("sets input value", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}login`
    });
    const page = await browser.page();

    const [username, password] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username).toBeFalsy();
    expect(password).toBeFalsy();

    await browser.runStep({
      action: "type",
      locator: { xpath: '//*[@id="username"]' },
      value: "spirit"
    });

    const [username2, password2] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username2).toBe("spirit");
    expect(password2).toBeFalsy();

    await browser.runStep({
      action: "type",
      locator: { xpath: '//*[@id="password"]' },
      value: "password"
    });

    const [username3, password3] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username3).toBe("spirit");
    expect(password3).toBe("password");

    await browser.close();
  });

  test("selects option in select", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}dropdown`
    });
    const page = await browser.page();

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });

    expect(selectValue).toBeFalsy();

    await browser.runStep({
      action: "type",
      locator: { tagName: "select" },
      value: "2"
    });

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });

    expect(selectValue2).toBe("2");

    await browser.close();
  });
});
