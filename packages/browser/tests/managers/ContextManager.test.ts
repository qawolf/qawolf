import { launch } from "../../src/launch";
import { ContextManager } from "../../src";

describe("ContextManager", () => {
  it("disposes when the context is closed", async () => {
    const { browser, context } = await launch();
    const manager = new ContextManager(context);
    expect(manager._disposed).toBe(false);
    await browser.close();
    expect(manager._disposed).toBe(true);
  });

  describe("findPage", () => {
    it("waits for a page to open", async () => {
      const { browser, context } = await launch();

      const manager = new ContextManager(context);

      // start finding the page before it is created
      const pagePromises = Promise.all([
        manager.findPage({ page: 0 }),
        manager.findPage({ page: 1 })
      ]);
      context.newPage();
      context.newPage();

      const [pageZero, pageOne] = await pagePromises;
      expect(pageZero.qawolf().index()).toBe(0);
      expect(pageOne.qawolf().index()).toBe(1);

      await browser.close();
    });
  });
});
