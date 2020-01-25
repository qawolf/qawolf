import { CONFIG } from "@qawolf/config";
import { clearElement } from "../../src/actions";
import { launch } from "../../src/context/launch";

describe("clearElement", () => {
  it("clears the input value", async () => {
    const context = await launch({
      url: `${CONFIG.testUrl}login`
    });
    const page = await context.page();

    const usernameElement = await context.find({ css: "#username" });
    await usernameElement.evaluate(
      (element: HTMLInputElement) => (element.value = "spirit")
    );

    const username1 = await page.$eval(
      "#username",
      (i: HTMLInputElement) => i.value
    );
    expect(username1).toBe("spirit");

    await usernameElement.focus();
    await clearElement(usernameElement);

    const username2 = await page.$eval(
      "#username",
      (i: HTMLInputElement) => i.value
    );
    expect(username2).toBe("");

    await context.close();
  });
});
