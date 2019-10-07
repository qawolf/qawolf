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

  const newWindows = pages.filter(
    p => p.url() === `${CONFIG.testUrl}windows/new`
  );
  expect(newWindows.length).toEqual(2);

  await browser.close();
}, 10000);
