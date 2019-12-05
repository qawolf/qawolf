import { CONFIG } from "@qawolf/config";
import { typeElement } from "../../src/actions";
import { Browser } from "../../src/Browser";

describe("typeElement", () => {
  it("sets input value", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}login`
    });
    const page = await browser.currentPage();

    const usernameElement = await browser.find({ css: "#username" });
    const passwordElement = await browser.find({ css: "#password" });

    await usernameElement.focus();
    await typeElement(page, "spirit");

    const [username1, password1] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );
    expect(username1).toBe("spirit");
    expect(password1).toBeFalsy();

    await passwordElement.focus();
    await typeElement(page, "password");

    const [username2, password2] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );
    expect(username2).toBe("spirit");
    expect(password2).toBe("password");

    await browser.close();
  });
});
