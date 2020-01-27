import { CONFIG } from "@qawolf/config";
import { launch } from "../../src/context/launch";
import { hasText } from "../../src/find/hasText";

describe("BrowserContext.click", () => {
  it("clicks on icon in button", async () => {
    const context = await launch({ url: `${CONFIG.testUrl}login` });
    const page = await context.page();

    const hasInvalidUsernameText = await hasText(page, "username is invalid", {
      timeoutMs: 250
    });
    expect(hasInvalidUsernameText).toBe(false);

    await context.click({ html: "<i>Login</i>" });
    await page.waitForNavigation();

    const hasInvalidUsernameText2 = await hasText(page, "username is invalid");
    expect(hasInvalidUsernameText2).toBe(true);

    await context.close();
  });
});

describe("Page.click", () => {
  it("clicks on link", async () => {
    const context = await launch({ url: CONFIG.testUrl });
    const page = await context.page();

    await page.qawolf.click({ html: "<a>broken images</a>" });
    await page.waitForNavigation();

    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await context.close();
  });
});
