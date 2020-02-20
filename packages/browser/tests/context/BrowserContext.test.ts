import { CONFIG } from "@qawolf/config";
import { launch } from "../../src/context/launch";

describe("BrowserContext.close", () => {
  it("closes the parent Browser", async () => {
    const context = await launch({ url: CONFIG.sandboxUrl });
    expect(context.browser().isConnected()).toEqual(true);
    await context.close();
    expect(context.browser().isConnected()).toEqual(false);
  });
});

describe("BrowserContext.page", () => {
  it("waits for a page to open", async () => {
    const context = await launch({ url: CONFIG.sandboxUrl });

    const pagePromise = context.page({ page: 1 });
    await context.newPage();
    expect((await pagePromise).qawolf().index()).toEqual(1);

    await context.close();
  });

  it("chooses the first open page if the current page is closed", async () => {
    const context = await launch({ url: CONFIG.sandboxUrl });

    const pageOne = await context.newPage();

    // change the current page to 1
    await context.page({ page: 1 });
    let currentPage = await context.page();
    expect(currentPage.qawolf().index()).toEqual(1);

    await pageOne.close();

    currentPage = await context.page();
    expect(currentPage.qawolf().index()).toEqual(0);

    await context.close();
  });
});

describe("BrowserContext.find", () => {
  it("finds an element", async () => {
    const context = await launch({ url: `${CONFIG.sandboxUrl}buttons` });

    const elementHandle = await context.find({ css: "#html-button" });
    expect(elementHandle).toBeTruthy();
    expect(
      await elementHandle!.evaluate(e => (e as HTMLButtonElement).type)
    ).toBe("submit");

    await context.close();
  });
});
