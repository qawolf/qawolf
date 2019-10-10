import { Browser } from "./Browser";
import { CONFIG } from "../config";
import { runStep } from "./runStep";
import { $xText } from "./pageUtils";

describe("runStep", () => {
  test("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.currentPage();

    await runStep(page, {
      action: "click",
      target: { xpath: '//*[@id="content"]/ul/li[3]/a' }
    });

    await page.waitForNavigation();

    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });

  test("clicks on icon in button", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const messageText = await $xText(page, '//*[@id="flash-messages"]');
    expect(messageText).not.toContain("username is invalid");

    await runStep(page, {
      action: "click",
      target: { tagName: "i" }
    });

    const messageText2 = await $xText(page, '//*[@id="flash"]');
    expect(messageText2).toContain("username is invalid");

    await browser.close();
  });

  test("scrolls to given position", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}large` });
    const page = await browser.currentPage();

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await browser.runStep({
      action: "scroll",
      target: { xpath: "scroll" },
      scrollTo: 1000
    });

    const nextYPosition = await page.evaluate(() => window.pageYOffset);
    expect(nextYPosition).toBe(1000);

    await browser.runStep({
      action: "scroll",
      target: { xpath: "scroll" },
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
    const page = await browser.currentPage();

    const initialYPosition = await page.evaluate(() => window.pageYOffset);
    expect(initialYPosition).toBe(0);

    await browser.runStep({
      action: "scroll",
      target: { xpath: "scroll" },
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
    const page = await browser.currentPage();

    const [username, password] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username).toBeFalsy();
    expect(password).toBeFalsy();

    await browser.runStep({
      action: "input",
      target: { xpath: '//*[@id="username"]' },
      value: "spirit"
    });

    const [username2, password2] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );

    expect(username2).toBe("spirit");
    expect(password2).toBeFalsy();

    await browser.runStep({
      action: "input",
      target: { xpath: '//*[@id="password"]' },
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
    const page = await browser.currentPage();

    const selectValue = await page.evaluate(() => {
      const select = document.getElementsByTagName("select")[0];
      return select.value;
    });

    expect(selectValue).toBeFalsy();

    await browser.runStep({
      action: "input",
      target: { tagName: "select" },
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
