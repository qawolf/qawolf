import { CONFIG } from "@qawolf/config";
import { Browser } from "../../src/Browser";
import { click } from "../../src/actions";
import { $xText } from "../../src/pageUtils";

describe("click", () => {
  it("clicks on link", async () => {
    const browser = await Browser.create({ url: CONFIG.testUrl });
    const page = await browser.currentPage();

    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        textContent: "broken images",
        xpath: '//*[@id="content"]/ul/li[3]/a'
      }
    });

    await click(element);
    await page.waitForNavigation();
    expect(page.url()).toBe(`${CONFIG.testUrl}broken_images`);

    await browser.close();
  });

  it("clicks on icon in button", async () => {
    const browser = await Browser.create({ url: `${CONFIG.testUrl}login` });
    const page = await browser.currentPage();

    const messageText = await $xText(page, '//*[@id="flash-messages"]');
    expect(messageText).not.toContain("username is invalid");

    const element = await browser.element({
      action: "click",
      index: 0,
      target: {
        tagName: "i",
        textContent: "login",
        xpath: "//*[@id='login']/button/i"
      }
    });
    await click(element);

    const messageText2 = await $xText(page, '//*[@id="flash"]');
    expect(messageText2).toContain("username is invalid");

    await browser.close();
  });
});
