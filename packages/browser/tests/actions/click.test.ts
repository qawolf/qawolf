import { CONFIG } from "@qawolf/config";
import { launch } from "../../src/browser/launch";
import { hasText } from "../../src/find/hasText";

describe("Browser.click", () => {
  it("clicks on icon in button", async () => {
    const browser = await launch({ url: `${CONFIG.testUrl}login` });
    const page = await browser.page();

    const hasInvalidUsernameText = await hasText(page, "username is invalid", {
      timeoutMs: 250
    });
    expect(hasInvalidUsernameText).toBe(false);

    await browser.click({ html: "<i>Login</i>" });
    await page.waitForNavigation();

    const hasInvalidUsernameText2 = await hasText(page, "username is invalid");
    expect(hasInvalidUsernameText2).toBe(true);

    await browser.close();
  });
});

describe("Page.click", () => {
  it("clicks on link", async () => {
    const browser = await launch({ url: CONFIG.testUrl });
    const page = await browser.page();

    await page.qawolf.click({ html: "<a>broken images</a>" });
    await page.waitForNavigation();

    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });
});
