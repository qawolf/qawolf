import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { clickElement } from "../../src/actions";
import { hasText } from "../../src/find/hasText";

describe("clickElement", () => {
  it("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.currentPage();

    const element = await browser.find({ html: "<a>broken images</a>" });
    await clickElement(element);

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

    const element = await browser.find({ html: "<i>Login</i>" });
    await clickElement(element);

    const hasInvalidUsernameText2 = await hasText(page, "username is invalid");
    expect(hasInvalidUsernameText2).toBe(true);

    await browser.close();
  });
});
