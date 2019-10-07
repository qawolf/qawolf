import { $xText } from "../browser/pageUtils";
import { CONFIG } from "../config";
import { createRunTest } from "./createRunTest";
import { redirectJob } from "../fixtures/redirectJob";

test("redirect test works", async () => {
  const { browser, success } = await createRunTest({
    ...redirectJob,
    url: CONFIG.testUrl
  });
  expect(success).toBeTruthy();

  const page = (await browser.pages())[0];

  const header = await $xText(page, '//*[@id="content"]/div/h3');
  expect(header).toEqual("Status Codes");
  await browser.close();
}, 20000);
