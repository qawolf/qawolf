import { $xText } from "../browser/Browser";
import { CONFIG } from "../config";
import { createRunTest } from "./createRunTest";
import { multipleWindowsJob } from "../fixtures/multipleWindowsJob";

test("multiple_windows test works", async () => {
  const { browser, success } = await createRunTest({
    ...multipleWindowsJob,
    url: `${CONFIG.testUrl}windows`
  });

  expect(success).toBeTruthy();

  const pages = await browser.pages();

  const pageOneHeader = await $xText(pages[0], '//*[@id="content"]/div/h3');
  expect(pageOneHeader).toEqual("Opening a new window");

  expect(await $xText(pages[1], "/html/body/div/h3")).toEqual("New Window");
  expect(await $xText(pages[2], "/html/body/div/h3")).toEqual("New Window");

  await browser.close();
}, 10000);
