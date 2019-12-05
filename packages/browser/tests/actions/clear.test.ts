import { CONFIG } from "@qawolf/config";
import { clearElement } from "../../src/actions";
import { Browser } from "../../src/Browser";

describe("clearElement", () => {
  it("clears the input value", async () => {
    const browser = await Browser.create({
      url: `${CONFIG.testUrl}login`
    });
    const page = await browser.currentPage();

    const usernameElement = await browser.find({ css: "#username" });
    await usernameElement.evaluate(
      (element: HTMLInputElement) => (element.value = "spirit")
    );

    const username1 = await page.$eval(
      "#username",
      (i: HTMLInputElement) => i.value
    );
    expect(username1).toBe("spirit");

    await clearElement(usernameElement);

    const username2 = await page.$eval(
      "#username",
      (i: HTMLInputElement) => i.value
    );
    expect(username2).toBe("");

    await browser.close();
  });
});
