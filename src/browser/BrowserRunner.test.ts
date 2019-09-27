import { $xText } from "./Browser";
import { BrowserRunner } from "./BrowserRunner";
import { redirectJob, windowsJob } from "../fixtures/job";

test("BrowserRunner re-runs steps after navigation", async () => {
  const runner = new BrowserRunner();
  await runner.run(redirectJob);

  const page = await runner.browser.page();
  await page.waitForNavigation();

  const header = await $xText(page, '//*[@id="content"]/div/h3');
  expect(header).toEqual("Status Codes");
  await runner.close();
}, 10000);

test("BrowserRunner works for multiple windows", async () => {
  const runner = new BrowserRunner();
  await runner.run(windowsJob);

  const pageOneHeader = await $xText(
    await runner.browser.page(0),
    '//*[@id="content"]/div/h3'
  );
  expect(pageOneHeader).toEqual("Opening a new window");

  const pageTwo = await runner.browser.page(1);
  expect(await $xText(pageTwo, "/html/body/div/h3")).toEqual("New Window");

  const pageThree = await runner.browser.page(2);
  expect(await $xText(pageThree, "/html/body/div/h3")).toEqual("New Window");

  await runner.close();
}, 10000);
