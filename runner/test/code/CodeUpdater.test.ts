import { CodeUpdater } from "../../src/code/CodeUpdater";
import { launch, setBody, sleep } from "../utils";

it("updates code", async () => {
  const { browser, context, page } = await launch();

  await setBody(page, "<button>Hello</button>");

  const updater = new CodeUpdater({ page });
  updater.setContext(context);

  updater.updateCode({
    code: "// 🐺 QA Wolf will create code here",
    version: 1,
  });

  await updater.enable();

  await page.click("button");

  // let events propagate
  await sleep(0);

  // we do not expect the code to create the page
  // since we enabled the updater after those steps
  expect(updater._code).toMatchInlineSnapshot(`
    "await page.click(\\"text=Hello\\");
    // 🐺 QA Wolf will create code here"
  `);

  await browser.close();
});
