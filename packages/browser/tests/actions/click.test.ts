import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { click } from "../../src/actions";
import { hasText } from "../../src/find/hasText";

describe("click", () => {
  it("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.currentPage();

    const element = await browser.findElement({ text: "broken images" });
    await click(element);

    await page.waitForNavigation();
    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });

  it("clicks on icon in button", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const hasInvalidUsernameText = await hasText(
      page,
      "username is invalid",
      250
    );
    expect(hasInvalidUsernameText).toBe(false);

    const element = await browser.findElement({ html: "<i>Login</i>" });
    await click(element);

    const hasInvalidUsernameText2 = await hasText(page, "username is invalid");
    expect(hasInvalidUsernameText2).toBe(true);

    await browser.close();
  });
});
