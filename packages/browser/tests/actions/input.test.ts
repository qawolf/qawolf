import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { input } from "../../src/actions";

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
