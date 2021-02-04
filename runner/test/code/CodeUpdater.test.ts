import { Browser, BrowserContext } from "playwright";

import { CodeUpdater } from "../../src/code/CodeUpdater";
import { launch } from "../../src/environment/launch";
import { TEST_URL } from "../utils";

describe("CodeUpdater", () => {
  let browser: Browser;
  let context: BrowserContext;

  const updater = new CodeUpdater({});

  beforeAll(async () => {
    const launchResult = await launch({ headless: true });

    browser = launchResult.browser;
    context = launchResult.context;

    updater.setContext(context);

    updater.updateCode({
      code: "// 🐺 QA Wolf will create code here",
      version: 1,
    });
  });

  afterAll(() => browser.close());

  it("updates code", async () => {
    const page = await context.newPage();
    await page.goto(TEST_URL);

    updater._variables.page = page;

    await updater.enable();

    await page.click("a");

    // let events propagate
    await new Promise((r) => setTimeout(r, 0));

    // we do not expect the code to create the page
    // since we enabled the updater after those steps
    expect(updater._code).toMatchInlineSnapshot(`
      "await page.click(\\"text=Buttons\\");
      // 🐺 QA Wolf will create code here"
    `);
  });
});
