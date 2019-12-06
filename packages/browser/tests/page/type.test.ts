import { CONFIG } from "@qawolf/config";
import { launch } from "../../src";

describe("typeElement", () => {
  it("sets input value", async () => {
    const browser = await launch({
      url: `${CONFIG.testUrl}login`
    });
    const page = await browser.page();

    await page.qawolf.type({ css: "#username" }, "spirit");

    const [username1, password1] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );
    expect(username1).toBe("spirit");
    expect(password1).toBeFalsy();

    await page.qawolf.type({ css: "#password" }, "password");

    const [username2, password2] = await page.$$eval(
      "input",
      (inputs: HTMLInputElement[]) => inputs.map(i => i.value)
    );
    expect(username2).toBe("spirit");
    expect(password2).toBe("password");

    await browser.close();
  });
});
