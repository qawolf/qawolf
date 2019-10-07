import { CONFIG } from "../config";
import { createRunTest } from "./createRunTest";
import { multipleWindowsJob } from "../fixtures/multipleWindowsJob";
import { sleep } from "../utils";

test("multiple_windows test works", async () => {
  const { browser, success } = await createRunTest({
    ...multipleWindowsJob,
    url: `${CONFIG.testUrl}windows`
  });
  expect(success).toBeTruthy();

  // XXX remove all arbitrary sleeps
  // give a little time for the page to open
  await sleep(1000);

  const pages = await browser.pages();
  const newWindows = pages.filter(
    p => p.url() === `${CONFIG.testUrl}windows/new`
  );
  expect(newWindows.length).toEqual(2);

  await browser.close();
}, 20000);
