import { CONFIG } from "@qawolf/config";
import { Browser } from "../src/Browser";
import { click, input, scroll } from "../src/actions";
import { $xText } from "../src/pageUtils";

describe("click", () => {
  it("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.currentPage();

    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        textContent: "broken images",
        xpath: '//*[@id="content"]/ul/li[3]/a'
      }
    });

    await click(element);
    await page.waitForNavigation();
    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });

  it("clicks on icon in button", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const messageText = await $xText(page, '//*[@id="flash-messages"]');
    expect(messageText).not.toContain("username is invalid");

    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        tagName: "i",
        textContent: "login",
        xpath: "//*[@id='login']/button/i"
      }
    });
    await click(element);

    const messageText2 = await $xText(page, '//*[@id="flash"]');
    expect(messageText2).toContain("username is invalid");

    await browser.close();
  });
});

describe("input", () => {
  it("sets input value", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}login`
    });
    const page = await browser.currentPage();

    const [username, password] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username).toBeFalsy();
    expect(password).toBeFalsy();

    let element = await browser.element({
      action: "input",
      index: 0,
      target: { id: "username" }
    });
    await input(element, "spirit");

    const [username2, password2] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username2).toBe("spirit");
    expect(password2).toBeFalsy();

    element = await browser.element({
      action: "input",
      index: 0,
      target: { id: "password", xpath: '//*[@id="password"]' }
    });
    await input(element, "password");

    const [username3, password3] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username3).toBe("spirit");
    expect(password3).toBe("password");

    await browser.close();
  });

  it("selects option in select", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}dropdown`
    });
    const page = await browser.currentPage();

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });
    expect(selectValue).toBeFalsy();

    const element = await browser.element({
      action: "input",
      index: 0,
      target: { id: "dropdown", tagName: "select" }
    });
    await input(element, "2");

    const selectValue2 = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });

    expect(selectValue2).toBe("2");

    await browser.close();
  });
});

describe("scroll", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await Browser.create();
  });

  afterAll(() => browser.close());

  it("scrolls to a given position", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}large`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);
    await scroll(page, 1000);

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await scroll(page, 0);

    const finalYPosition = await page.evaluate(() => window.pageYOffset);
    expect(finalYPosition).toBe(0);
  });

  it("scrolls in infinite scroll", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await scroll(page, 2000);
    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(2000);
  });

  it("throws error if timeout", async () => {
    const page = await browser.goto(`${CONFIG.testUrl}infinite_scroll`);

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    const testFn = async () => await scroll(page, 2000, 0);
    await expect(testFn()).rejects.toThrowError();
  });
});
