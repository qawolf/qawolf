import { sleep } from "@qawolf/web";
import { ContextManager, launch, LaunchResult } from "../src";
import { registerHtmlSelector } from "../src/HtmlSelectorEngine";

describe("HtmlSelectorEngine", () => {
  let launched: LaunchResult;
  let manager: ContextManager;

  beforeAll(async () => {
    await registerHtmlSelector();

    launched = await launch({ devtools: true });
    manager = new ContextManager(launched.context);

    await launched.context.newPage();
  });

  // afterAll(() => launched.browser.close());

  it("finds element", async () => {
    const page = await manager.findPage();
    await page.$("html=body");

    // const manager = new ContextManager(context);
    // expect(manager._disposed).toBe(false);
    // await browser.close();
    // expect(manager._disposed).toBe(true);
  });
});
